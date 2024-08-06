import {
    fieldName,
    findFocusFlag,
    findInputFrames,
    findTopMostFrame,
    getAllFocusFlags,
} from './utils';

figma.showUI(__html__);
figma.ui.resize(400, 300);

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

        const selectedNode = selection[0]; // The initially selected node
        const selectedFrame = findTopMostFrame(selectedNode) as FrameNode;

        try {
            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
        } catch (error) {
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

        const variableObjects: {
            textVariable: Variable;
            focusFlag: Variable;
        }[] = [];

        // Create the caret frame for the "on" state
        const caretFrameOn = figma.createFrame();
        const caretFrameOnInner = figma.createFrame();
        const caretFrameInnerHegiht = 20;
        caretFrameOn.resize(1, 10);
        caretFrameOn.clipsContent = false;
        caretFrameOnInner.resize(1, caretFrameInnerHegiht);
        caretFrameOnInner.y = -5;
        caretFrameOnInner.fills = [
            {
                type: 'SOLID',
                color: { r: 0, g: 0, b: 0 },
            },
        ];

        // Create the caret frame for the "off" state
        const caretFrameOff = figma.createFrame();
        const caretFrameOffInner = figma.createFrame();
        caretFrameOff.resize(1, 10);
        caretFrameOff.clipsContent = false;
        caretFrameOffInner.resize(1, caretFrameInnerHegiht);
        caretFrameOffInner.y = -caretFrameInnerHegiht / 4;
        caretFrameOffInner.fills = [
            {
                type: 'SOLID',
                color: { r: 0, g: 0, b: 0 },
                opacity: 0,
            },
        ];

        // Create components from the frames
        caretFrameOff.appendChild(caretFrameOffInner);
        caretFrameOn.appendChild(caretFrameOnInner);

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

        // Add reactions after all variableObjects are created
        const lastVariableID =
            variableCollection.variableIds[
                variableCollection.variableIds.length - 1
            ];
        const lastVariable = await figma.variables.getVariableByIdAsync(
            lastVariableID
        );

        // Extract the number using a regular expression
        const match = lastVariable?.name.match(/_(\d+)$/);
        let lastNumber = 0;

        if (match) {
            lastNumber = parseInt(match[1], 10) + 1;
        }

        for (let i = 0; i < msg.count; i++) {
            const newNumber = lastNumber + i;
            const variableName = `TextVariable_${newNumber}`;
            const focusFlagName = `TextFieldFocus_${newNumber}`;
            const placeholderFlagName = `TextFieldPlaceholder_${newNumber}`;

            const textVariable = figma.variables.createVariable(
                variableName,
                variableCollection,
                'STRING'
            );

            const focusFlag = figma.variables.createVariable(
                focusFlagName,
                variableCollection,
                'BOOLEAN'
            );

            const placeholderFlag = figma.variables.createVariable(
                placeholderFlagName,
                variableCollection,
                'BOOLEAN'
            );

            variableObjects.push({ textVariable, focusFlag });

            const modeIds = Object.keys(textVariable.valuesByMode);

            if (modeIds.length > 0) {
                const defaultModeId = modeIds[0];
                textVariable.setValueForMode(defaultModeId, '');
                focusFlag.setValueForMode(defaultModeId, false);
                placeholderFlag.setValueForMode(defaultModeId, true);

                const inputFrame = figma.createFrame();
                inputFrame.layoutMode = 'HORIZONTAL';
                inputFrame.counterAxisAlignItems = 'CENTER';
                inputFrame.primaryAxisSizingMode = 'AUTO';
                inputFrame.counterAxisSizingMode = 'AUTO';
                inputFrame.paddingLeft = 12;
                inputFrame.paddingRight = 12;
                inputFrame.y = 20 + i * 80;
                inputFrame.x = 24;
                inputFrame.paddingTop = 12;
                inputFrame.paddingBottom = 12;
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
                inputFrame.name = fieldName;

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
                const placeholder = figma.createText();
                // Creating text variable
                text.fontName = { family: 'Roboto', style: 'Regular' };
                text.fontSize = 14;
                text.setBoundVariable('characters', textVariable);

                // Creating text placeholder
                placeholder.fontName = { family: 'Roboto', style: 'Regular' };
                placeholder.fontSize = 14;
                placeholder.opacity = 0.6;
                placeholder.name = 'Placeholder';
                placeholder.characters = 'Enter your value';
                placeholder.setBoundVariable('visible', placeholderFlag);

                const caretInstance = caretFrameOffComponent.createInstance();
                inputFrame.appendChild(text);
                inputFrame.appendChild(placeholder);
                inputFrame.appendChild(caretInstance);
                selectedFrame.appendChild(inputFrame);
                caretInstance.setBoundVariable('visible', focusFlag);
            }
        }

        const variablePair = await getAllFocusFlags(variableCollection);

        if (variablePair.length > 100) {
            figma.notify(
                "You've created too many inputs using the plugin, and you have about 50 input field variables created, please remove the variable collection - Editable Inputs (AM Design) and start again to avoid performance issues with the plugin"
            );
        }

        let inputFrames: FrameNode[] = []; // Store inputFrame references

        inputFrames = findInputFrames(selectedFrame, inputFrames);

        // On Blur Event
        for (let i = 0; i < inputFrames.length; i++) {
            const inputFrame = inputFrames[i];

            const textFrame = inputFrame.children.find(
                (child) => child.name === 'Text'
            );

            const textFieldVarID = textFrame?.boundVariables?.characters?.id;

            if (textFieldVarID) {
                const focusFlagPair = findFocusFlag(
                    variablePair,
                    textFieldVarID
                );

                console.log(focusFlagPair);

                const setFocusActions = [
                    // Set the current focusFlag to true
                    {
                        type: 'SET_VARIABLE' as const, // Ensuring exact literal type match
                        variableId: focusFlagPair?.focusFlagID,
                        variableValue: {
                            resolvedType: 'BOOLEAN',
                            type: 'BOOLEAN',
                            value: true,
                        },
                    },
                    {
                        type: 'SET_VARIABLE' as const, // Ensuring exact literal type match
                        variableId: focusFlagPair?.placeholderVariableID,
                        variableValue: {
                            resolvedType: 'BOOLEAN',
                            type: 'BOOLEAN',
                            value: false,
                        },
                    },
                    // Set all other focusFlags to false
                    ...variablePair
                        .filter(
                            (flag) =>
                                flag.focusFlag.id !== focusFlagPair?.focusFlagID
                        )
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
        }

        const reactions: Reaction[] = [];

        const keyMap: { [key: number]: string } = {
            32: ' ',
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
