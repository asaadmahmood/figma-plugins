figma.showUI(__html__);
figma.ui.resize(400, 300);

interface FocusFlagPair {
    focusFlag: Variable;
    textVariable: Variable;
}

async function getAllFocusFlags(
    collection: VariableCollection
): Promise<FocusFlagPair[]> {
    const focusFlagPairs: FocusFlagPair[] = [];
    const allVariables: Variable[] = [];

    // Fetch all variables once
    for (const variableId of collection.variableIds) {
        const variableObject = await figma.variables.getVariableByIdAsync(
            variableId
        );
        if (variableObject) {
            allVariables.push(variableObject);
        }
    }

    // Find and pair focus flags and text variables
    for (const variable of allVariables) {
        if (variable.name.includes('TextFieldFocus')) {
            console.log(variable.name);
            const identifier = variable.name.split('_').slice(1).join('_');
            console.log('🚀 ~ identifier:', identifier);

            const textVariableName = `TextVariable_${identifier}`;

            const textVariable = allVariables.find(
                (v) => v.name === textVariableName
            );

            if (textVariable) {
                focusFlagPairs.push({ focusFlag: variable, textVariable });
            }
        }
    }

    console.log('Pair');
    console.log(focusFlagPairs);

    return focusFlagPairs;
}

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
            (collection) => collection.name === 'Ediable Inputs (AM Design)'
        );

        if (!variableCollection) {
            variableCollection = figma.variables.createVariableCollection(
                'Ediable Inputs (AM Design)'
            );
        }

        try {
            const modeId = variableCollection.addMode('New Mode');
            variableCollection.removeMode(modeId);
            console.log('Mode added successfully:', modeId);
        } catch (error: any) {
            // Use 'any' or 'unknown' for catch clause variable type
            if (error.message && error.message.includes('Limited to')) {
                console.error(
                    'Mode addition failed due to plan limitations:',
                    error.message
                );
                figma.notify(
                    'Please move this file to a paid plan to use this feature.'
                );
            } else {
                console.error('An unexpected error occurred:', error);
                figma.notify('An unexpected error occurred. Please try again.');
            }
            return;
        }

        const variableObjects: {
            textVariable: Variable;
            focusFlag: Variable;
        }[] = [];

        const inputFrames: FrameNode[] = []; // Store inputFrame references

        // Create the caret frame for the "on" state
        const caretFrameOn = figma.createFrame();
        caretFrameOn.resize(1, 19);
        caretFrameOn.fills = [
            {
                type: 'SOLID',
                color: { r: 0, g: 0, b: 0 },
            },
        ];

        // Create the caret frame for the "off" state
        const caretFrameOff = figma.createFrame();
        caretFrameOff.resize(1, 18);
        caretFrameOff.fills = [
            {
                type: 'SOLID',
                color: { r: 0, g: 0, b: 0 },
                opacity: 0,
            },
        ];

        // Create components from the frames
        const caretFrameOnComponent =
            figma.createComponentFromNode(caretFrameOn);
        const caretFrameOffComponent =
            figma.createComponentFromNode(caretFrameOff);

        // Combine the components into variants
        const caretComponent = figma.combineAsVariants(
            [caretFrameOnComponent, caretFrameOffComponent],
            figma.currentPage
        );

        caretComponent.name = 'Caret Indicator';

        // Rename the variants to "on" and "off"
        caretFrameOnComponent.name = 'State=on';
        caretFrameOffComponent.name = 'State=off';

        // Add interaction to change variant after a delay of 100ms
        const changeToOnAction: Action = {
            type: 'NODE',
            destinationId: caretFrameOnComponent.id,
            navigation: 'CHANGE_TO',
            transition: null,
        };

        const changeToOffAction: Action = {
            type: 'NODE',
            destinationId: caretFrameOffComponent.id,
            navigation: 'CHANGE_TO',
            transition: null,
        };

        const afterTimeoutTrigger: Trigger = {
            type: 'AFTER_TIMEOUT',
            timeout: 0.5,
        };

        const reaction: Reaction = {
            trigger: afterTimeoutTrigger,
            actions: [changeToOnAction],
        };

        const reactionBack: Reaction = {
            trigger: afterTimeoutTrigger,
            actions: [changeToOffAction],
        };

        await caretFrameOffComponent.setReactionsAsync([reaction]);
        await caretFrameOnComponent.setReactionsAsync([reactionBack]);

        for (let i = 0; i < msg.count; i++) {
            const timestamp = new Date().getTime();
            const variableName = `TextVariable_${timestamp}_${i + 1}`;
            const textVariable = figma.variables.createVariable(
                variableName,
                variableCollection,
                'STRING'
            );

            const focusFlagName = `TextFieldFocus_${timestamp}_${i + 1}`;
            const focusFlag = figma.variables.createVariable(
                focusFlagName,
                variableCollection,
                'BOOLEAN'
            );

            variableObjects.push({ textVariable, focusFlag });

            const modeIds = Object.keys(textVariable.valuesByMode);

            if (modeIds.length > 0) {
                const defaultModeId = modeIds[0];
                textVariable.setValueForMode(defaultModeId, 'Textfield Value');
                focusFlag.setValueForMode(defaultModeId, false);

                const inputFrame = figma.createFrame();
                inputFrame.layoutMode = 'HORIZONTAL';
                inputFrame.counterAxisAlignItems = 'CENTER';
                inputFrame.primaryAxisSizingMode = 'AUTO';
                inputFrame.counterAxisSizingMode = 'AUTO';
                inputFrame.paddingLeft = 12;
                inputFrame.paddingRight = 12;
                inputFrame.y = 20 + i * 80;
                inputFrame.x = 24;
                inputFrame.paddingTop = 16;
                inputFrame.paddingBottom = 16;
                inputFrame.itemSpacing = 0;
                inputFrame.cornerRadius = 8;
                inputFrame.resize(250, inputFrame.height);
                inputFrame.fills = [
                    {
                        type: 'SOLID',
                        color: { r: 1, g: 1, b: 1 },
                        opacity: 0.8,
                    },
                ];
                inputFrame.strokes = [
                    {
                        type: 'SOLID',
                        color: { r: 0, g: 0, b: 0 },
                        opacity: 0.16,
                    },
                ];
                inputFrame.name = 'Input Field';

                const focusFrame = figma.createFrame();

                // Set the frame to cover the entire area of the inputFrame
                focusFrame.x = 0;
                focusFrame.y = 0;
                focusFrame.strokeWeight = 2;
                focusFrame.cornerRadius = 8;
                focusFrame.strokes = [
                    {
                        type: 'SOLID',
                        color: {
                            r: 13 / 255,
                            g: 28 / 255,
                            b: 227 / 255,
                        },
                    },
                ];

                // You can adjust other properties of focusFrame as needed
                focusFrame.name = 'Focus Frame';

                // Append the inner frame to the inputFrame
                inputFrame.appendChild(focusFrame);

                focusFrame.layoutPositioning = 'ABSOLUTE';
                focusFrame.resize(inputFrame.width, inputFrame.height);
                focusFrame.constraints = {
                    horizontal: 'STRETCH',
                    vertical: 'STRETCH',
                };
                focusFrame.setBoundVariable('visible', focusFlag);

                const text = figma.createText();
                text.fontName = { family: 'Roboto', style: 'Regular' };
                text.fontSize = 16;
                text.setBoundVariable('characters', textVariable);
                const caretInstance = caretFrameOffComponent.createInstance();
                inputFrame.appendChild(text);
                inputFrame.appendChild(caretInstance);
                selectedFrame.appendChild(inputFrame);
                inputFrames.push(inputFrame);
                caretInstance.setBoundVariable('visible', focusFlag);
            }
        }

        // Add reactions after all variableObjects are created
        const variablePair = await getAllFocusFlags(variableCollection);

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
                ...variablePair
                    .filter((flag) => flag.focusFlag.id !== focusFlag.id)
                    .map((flag) => ({
                        type: 'SET_VARIABLE' as const, // Ensuring exact literal type match
                        variableId: flag.focusFlag.id,
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

        const keyMap: { [key: number]: string } = {
            65: 'a',
            66: 'b',
            67: 'c',
            68: 'd',
            69: 'e',
            70: 'f',
            71: 'g',
            72: 'h',
            73: 'i',
            74: 'j',
            75: 'k',
            76: 'l',
            77: 'm',
            78: 'n',
            79: 'o',
            80: 'p',
            81: 'q',
            82: 'r',
            83: 's',
            84: 't',
            85: 'u',
            86: 'v',
            87: 'w',
            88: 'x',
            89: 'y',
            90: 'z',
            48: '0',
            49: '1',
            50: '2',
            51: '3',
            52: '4',
            53: '5',
            54: '6',
            55: '7',
            56: '8',
            57: '9',
            188: ',',
            190: '.',
            191: '/',
            186: ';',
            222: "'",
            219: '[',
            221: ']',
            192: '`',
            189: '-',
            187: '=',
            // Add other key codes as needed
            // Numpad keys
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9',
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111: '/',
        };

        for (const code in keyMap) {
            const reaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: [parseInt(code)],
                },
                actions: variablePair.map(({ focusFlag, textVariable }) => ({
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
                                                    value: keyMap[
                                                        parseInt(code)
                                                    ],
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
            ...Array.from({ length: 26 }, (_, i) => ({
                keyCodes: [16, i + 65],
                char: String.fromCharCode(i + 65),
            })), // Shift + A-Z for uppercase
        ];

        // Loop for shiftNumberKeyCodes (Shift + 1-9 and Shift + A-Z)
        for (const { keyCodes, char } of shiftNumberKeyCodes) {
            const reaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: keyCodes,
                },
                actions: variablePair.map(({ focusFlag, textVariable }) => ({
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
            actions: variablePair.map((vo) => ({
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

        const backspaceReaction: Reaction = {
            trigger: {
                type: 'ON_KEY_DOWN',
                device: 'KEYBOARD',
                keyCodes: [8], // Backspace key code
            },
            actions: variablePair.map(({ textVariable, focusFlag }) => ({
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
                                    value: '', // Set to an empty string as a placeholder
                                },
                            },
                        ],
                    },
                ],
            })),
        };
        reactions.push(backspaceReaction);

        await selectedFrame.setReactionsAsync(reactions);
    }

    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
