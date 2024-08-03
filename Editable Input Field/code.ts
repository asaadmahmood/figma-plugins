figma.showUI(__html__);

figma.ui.onmessage = async (msg: {
    type: string;
    count?: number;
    id?: string;
}) => {
    if (msg.type === 'create-rectangles' && msg.count) {
        const selection = figma.currentPage.selection;
        if (selection.length !== 1 || selection[0].type !== 'FRAME') {
            figma.notify(
                'Please select a single frame to insert input fields into.'
            );
            return;
        }

        const selectedFrame = selection[0] as FrameNode;

        try {
            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
            console.log('Font loaded successfully');
        } catch (error) {
            console.error('Font loading failed:', error);
            figma.notify(
                'Font loading failed. Please ensure the font is available.'
            );
            return;
        }

        const allCollections =
            await figma.variables.getLocalVariableCollectionsAsync();
        let variableCollection = allCollections.find(
            (collection) => collection.name === 'Text Variables'
        );

        if (!variableCollection) {
            variableCollection =
                figma.variables.createVariableCollection('Text Variables');
        }

        const variableObjects: {
            textVariable: Variable;
            focusFlag: Variable;
        }[] = [];

        const inputFrames: FrameNode[] = []; // Store inputFrame references

        for (let i = 0; i < msg.count; i++) {
            const variableName = `TextVariable_${i + 1}`;
            const textVariable = figma.variables.createVariable(
                variableName,
                variableCollection,
                'STRING'
            );

            const focusFlagName = `TextFieldFocus_${i + 1}`;
            const focusFlag = figma.variables.createVariable(
                focusFlagName,
                variableCollection,
                'BOOLEAN'
            );

            variableObjects.push({ textVariable, focusFlag });

            const modeIds = Object.keys(textVariable.valuesByMode);
            if (modeIds.length > 0) {
                const defaultModeId = modeIds[0];
                textVariable.setValueForMode(defaultModeId, '');
                focusFlag.setValueForMode(defaultModeId, false);

                const inputFrame = figma.createFrame();
                inputFrame.layoutMode = 'HORIZONTAL';
                inputFrame.counterAxisAlignItems = 'CENTER';
                inputFrame.primaryAxisSizingMode = 'AUTO';
                inputFrame.counterAxisSizingMode = 'AUTO';
                inputFrame.paddingLeft = 12;
                inputFrame.paddingRight = 12;
                inputFrame.paddingTop = 16;
                inputFrame.paddingBottom = 16;
                inputFrame.itemSpacing = 0;
                inputFrame.resize(250, inputFrame.height);
                inputFrame.fills = [
                    { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
                ];
                inputFrame.strokes = [
                    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
                ];
                inputFrame.name = 'Input Field';

                const text = figma.createText();
                text.fontName = { family: 'Roboto', style: 'Regular' };
                text.fontSize = 16;
                text.setBoundVariable('characters', textVariable);
                text.layoutAlign = 'STRETCH';
                text.layoutGrow = 1;
                text.resizeWithoutConstraints(
                    250 - inputFrame.paddingLeft - inputFrame.paddingRight,
                    text.height
                );
                inputFrame.appendChild(text);
                selectedFrame.appendChild(inputFrame);
                inputFrames.push(inputFrame);
            }
        }

        // Add reactions after all variableObjects are created
        for (let i = 0; i < inputFrames.length; i++) {
            const { focusFlag } = variableObjects[i];
            const inputFrame = inputFrames[i];

            const setFocusActions = [
                // Set the current focusFlag to true
                {
                    type: 'SET_VARIABLE' as const, // Ensuring exact literal type match
                    variableId: focusFlag.id,
                    variableValue: {
                        resolvedType: 'BOOLEAN',
                        type: 'BOOLEAN',
                        value: true,
                    },
                },
                // Set all other focusFlags to false
                ...variableObjects
                    .filter((vo) => vo.focusFlag.id !== focusFlag.id)
                    .map((vo) => ({
                        type: 'SET_VARIABLE' as const, // Ensuring exact literal type match
                        variableId: vo.focusFlag.id,
                        variableValue: {
                            resolvedType: 'BOOLEAN',
                            type: 'BOOLEAN',
                            value: false,
                        },
                    })),
            ];

            const focusReaction: Reaction = {
                trigger: { type: 'ON_CLICK' },
                actions: setFocusActions as [Action],
            };

            await inputFrame.setReactionsAsync([focusReaction]);
        }

        const reactions: Reaction[] = [];

        const keyCodes = [
            ...Array.from({ length: 26 }, (_, i) => i + 65), // A-Z
            ...Array.from({ length: 10 }, (_, i) => i + 48), // 0-9
        ];

        // Loop for keyCodes
        for (const code of keyCodes) {
            const reaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: [code],
                },
                actions: variableObjects.map(({ textVariable, focusFlag }) => ({
                    type: 'CONDITIONAL',
                    conditionalBlocks: [
                        {
                            condition: {
                                type: 'EXPRESSION',
                                resolvedType: 'BOOLEAN',
                                value: {
                                    expressionArguments: [
                                        {
                                            type: 'VARIABLE_ALIAS',
                                            resolvedType: 'BOOLEAN',
                                            value: {
                                                type: 'VARIABLE_ALIAS',
                                                id: focusFlag.id,
                                            },
                                        },
                                        {
                                            type: 'BOOLEAN',
                                            resolvedType: 'BOOLEAN',
                                            value: true,
                                        },
                                    ],
                                    expressionFunction: 'EQUALS',
                                },
                            },
                            actions: [
                                {
                                    type: 'SET_VARIABLE',
                                    variableId: textVariable.id,
                                    variableValue: {
                                        resolvedType: 'STRING',
                                        type: 'EXPRESSION',
                                        value: {
                                            expressionFunction: 'ADDITION',
                                            expressionArguments: [
                                                {
                                                    type: 'VARIABLE_ALIAS',
                                                    resolvedType: 'STRING',
                                                    value: {
                                                        type: 'VARIABLE_ALIAS',
                                                        id: textVariable.id,
                                                    },
                                                },
                                                {
                                                    type: 'STRING',
                                                    resolvedType: 'STRING',
                                                    value: String.fromCharCode(
                                                        code
                                                    ),
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                })),
            };

            reactions.push(reaction);
        }

        const shiftNumberKeyCodes = [
            { keyCodes: [16, 49], char: '!' },
            { keyCodes: [16, 50], char: '@' },
            { keyCodes: [16, 51], char: '#' },
            { keyCodes: [16, 52], char: '$' },
            { keyCodes: [16, 53], char: '%' },
            { keyCodes: [16, 54], char: '^' },
            { keyCodes: [16, 55], char: '&' },
            { keyCodes: [16, 56], char: '*' },
            { keyCodes: [16, 57], char: '(' },
            { keyCodes: [16, 48], char: ')' },
        ];

        // Loop for shiftNumberKeyCodes
        for (const { keyCodes, char } of shiftNumberKeyCodes) {
            const reaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: keyCodes,
                },
                actions: variableObjects.map(({ textVariable, focusFlag }) => ({
                    type: 'CONDITIONAL',
                    conditionalBlocks: [
                        {
                            condition: {
                                type: 'EXPRESSION',
                                resolvedType: 'BOOLEAN',
                                value: {
                                    expressionArguments: [
                                        {
                                            type: 'VARIABLE_ALIAS',
                                            resolvedType: 'BOOLEAN',
                                            value: {
                                                type: 'VARIABLE_ALIAS',
                                                id: focusFlag.id,
                                            },
                                        },
                                        {
                                            type: 'BOOLEAN',
                                            resolvedType: 'BOOLEAN',
                                            value: true,
                                        },
                                    ],
                                    expressionFunction: 'EQUALS',
                                },
                            },
                            actions: [
                                {
                                    type: 'SET_VARIABLE',
                                    variableId: textVariable.id,
                                    variableValue: {
                                        resolvedType: 'STRING',
                                        type: 'EXPRESSION',
                                        value: {
                                            expressionFunction: 'ADDITION',
                                            expressionArguments: [
                                                {
                                                    type: 'VARIABLE_ALIAS',
                                                    resolvedType: 'STRING',
                                                    value: {
                                                        type: 'VARIABLE_ALIAS',
                                                        id: textVariable.id,
                                                    },
                                                },
                                                {
                                                    type: 'STRING',
                                                    resolvedType: 'STRING',
                                                    value: char, // Use the character representation
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                })),
            };

            reactions.push(reaction);
        }

        const removeFocus: Reaction = {
            trigger: { type: 'ON_CLICK' },
            actions: variableObjects.map((vo) => ({
                type: 'SET_VARIABLE',
                variableId: vo.focusFlag.id,
                variableValue: {
                    resolvedType: 'BOOLEAN',
                    type: 'BOOLEAN',
                    value: false,
                },
            })),
        };

        reactions.push(removeFocus);

        for (const { textVariable, focusFlag } of variableObjects) {
            const backspaceReaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: [8],
                },
                actions: [
                    {
                        type: 'CONDITIONAL',
                        conditionalBlocks: [
                            {
                                condition: {
                                    type: 'EXPRESSION',
                                    resolvedType: 'BOOLEAN',
                                    value: {
                                        expressionArguments: [
                                            {
                                                type: 'VARIABLE_ALIAS',
                                                resolvedType: 'BOOLEAN',
                                                value: {
                                                    type: 'VARIABLE_ALIAS',
                                                    id: focusFlag.id,
                                                },
                                            },
                                            {
                                                type: 'BOOLEAN',
                                                resolvedType: 'BOOLEAN',
                                                value: true,
                                            },
                                        ],
                                        expressionFunction: 'EQUALS',
                                    },
                                },
                                actions: [
                                    {
                                        type: 'SET_VARIABLE',
                                        variableId: textVariable.id,
                                        variableValue: {
                                            resolvedType: 'STRING',
                                            type: 'STRING',
                                            value: '',
                                        },
                                    },
                                ],
                            },
                            {
                                condition: {
                                    type: 'EXPRESSION',
                                    resolvedType: 'BOOLEAN',
                                    value: {
                                        expressionArguments: [
                                            {
                                                type: 'VARIABLE_ALIAS',
                                                resolvedType: 'BOOLEAN',
                                                value: {
                                                    type: 'VARIABLE_ALIAS',
                                                    id: focusFlag.id,
                                                },
                                            },
                                            {
                                                type: 'BOOLEAN',
                                                resolvedType: 'BOOLEAN',
                                                value: false,
                                            },
                                        ],
                                        expressionFunction: 'EQUALS',
                                    },
                                },
                                actions: [], // Leave empty
                            },
                        ],
                    },
                ],
            };

            reactions.push(backspaceReaction);
        }

        await selectedFrame.setReactionsAsync(reactions);
    }

    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
