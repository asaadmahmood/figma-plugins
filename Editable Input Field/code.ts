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

        // Load the font only once before creating text nodes
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

        // Retrieve all existing variable collections
        const allCollections =
            await figma.variables.getLocalVariableCollectionsAsync();
        let variableCollection = allCollections.find(
            (collection) => collection.name === 'Text Variables'
        );

        // Create a variable collection if it doesn't exist
        if (!variableCollection) {
            variableCollection =
                figma.variables.createVariableCollection('Text Variables');
        }

        // Create focus flags
        let focusFlags: { [key: string]: Variable } = {};

        // Iterate over the count to create multiple inputs and variables
        for (let i = 0; i < msg.count; i++) {
            // Create a new variable for each input
            const variableName = `TextVariable_${i + 1}`;
            let textVariable = figma.variables.createVariable(
                variableName,
                variableCollection,
                'STRING'
            );

            // Create a focus flag for each input
            const focusFlagName = `TextFieldFocus_${i + 1}`;
            let focusFlag = figma.variables.createVariable(
                focusFlagName,
                variableCollection,
                'BOOLEAN'
            );
            focusFlags[focusFlagName] = focusFlag;

            // Retrieve the mode IDs
            const modeIds = Object.keys(textVariable.valuesByMode);

            // Set the value for the default mode (usually the first mode)
            if (modeIds.length > 0) {
                const defaultModeId = modeIds[0]; // Get the first mode ID
                textVariable.setValueForMode(defaultModeId, ''); // Initialize with an empty string
                focusFlag.setValueForMode(defaultModeId, false); // Initialize focus flag to false
            }

            // Create a frame to act as the input field container with auto layout
            const inputFrame = figma.createFrame();
            inputFrame.layoutMode = 'HORIZONTAL';
            inputFrame.counterAxisAlignItems = 'CENTER'; // Center text vertically
            inputFrame.primaryAxisSizingMode = 'AUTO'; // Set height to hug contents
            inputFrame.counterAxisSizingMode = 'AUTO';
            inputFrame.paddingLeft = 12;
            inputFrame.paddingRight = 12;
            inputFrame.paddingTop = 16;
            inputFrame.paddingBottom = 16;
            inputFrame.itemSpacing = 0;
            inputFrame.resize(250, inputFrame.height); // Set fixed width
            inputFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            inputFrame.strokes = [
                { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
            ];
            inputFrame.name = 'Input Field';

            // Create the text layer after ensuring the font is loaded
            const text = figma.createText();
            text.fontName = { family: 'Roboto', style: 'Regular' };
            text.fontSize = 16; // Set font size

            // Set the initial characters of the text node from the variable
            text.setBoundVariable('characters', textVariable); // Bind the text variable to the text node's characters

            // Set text width to fill container and height to hug contents
            text.layoutAlign = 'STRETCH'; // Fill container width
            text.layoutGrow = 1; // Allow the text to grow
            text.resizeWithoutConstraints(
                250 - inputFrame.paddingLeft - inputFrame.paddingRight,
                text.height
            ); // Ensure initial resize

            // Append the text layer to the input frame
            inputFrame.appendChild(text);

            // Append the input frame to the selected frame
            selectedFrame.appendChild(inputFrame);

            // Create an array to hold all reactions for this variable
            const reactions: Reaction[] = [];

            // Create reactions for alphanumeric characters and common special characters
            const keyCodes = [
                ...Array.from({ length: 26 }, (_, i) => i + 65), // A-Z
                ...Array.from({ length: 10 }, (_, i) => i + 48), // 0-9
            ];

            for (const code of keyCodes) {
                const reaction: Reaction = {
                    trigger: {
                        type: 'ON_KEY_DOWN',
                        device: 'KEYBOARD',
                        keyCodes: [code],
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
                                            value: String.fromCharCode(code), // Append the character based on the keycode
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                };

                reactions.push(reaction); // Add each reaction to the array
            }

            // Create reactions for 0-9 keys with Shift modifier
            const shiftNumberKeyCodes = [
                { keyCodes: [16, 49], char: '!' }, // Shift + 1
                { keyCodes: [16, 50], char: '@' }, // Shift + 2
                { keyCodes: [16, 51], char: '#' }, // Shift + 3
                { keyCodes: [16, 52], char: '$' }, // Shift + 4
                { keyCodes: [16, 53], char: '%' }, // Shift + 5
                { keyCodes: [16, 54], char: '^' }, // Shift + 6
                { keyCodes: [16, 55], char: '&' }, // Shift + 7
                { keyCodes: [16, 56], char: '*' }, // Shift + 8
                { keyCodes: [16, 57], char: '(' }, // Shift + 9
                { keyCodes: [16, 48], char: ')' }, // Shift + 0
            ];

            for (const key of shiftNumberKeyCodes) {
                const reaction: Reaction = {
                    trigger: {
                        type: 'ON_KEY_DOWN',
                        device: 'KEYBOARD',
                        keyCodes: key.keyCodes,
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
                                            value: key.char, // Append the character based on the Shift key
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                };

                reactions.push(reaction); // Add each reaction to the array
            }

            // Add reaction for backspace key (key code 8)
            const backspaceReaction: Reaction = {
                trigger: {
                    type: 'ON_KEY_DOWN',
                    device: 'KEYBOARD',
                    keyCodes: [8], // Backspace key code
                },
                actions: [
                    {
                        type: 'SET_VARIABLE',
                        variableId: textVariable.id,
                        variableValue: {
                            resolvedType: 'STRING',
                            type: 'STRING',
                            value: '', // Set variable to an empty string
                        },
                    },
                ],
            };

            reactions.push(backspaceReaction); // Add the backspace reaction to the array

            let testingFlag = figma.variables.createVariable(
                'whatever',
                variableCollection,
                'BOOLEAN'
            );

            const modeIds1 = Object.keys(textVariable.valuesByMode);

            // Set the value for the default mode (usually the first mode)
            if (modeIds1.length > 0) {
                const defaultModeId = modeIds[0]; // Get the first mode ID
                testingFlag.setValueForMode(defaultModeId, false); // Initialize focus flag to false
            }

            const focusReaction: Reaction = {
                trigger: {
                    type: 'ON_CLICK',
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
                                                    id: testingFlag.id,
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
                                        variableId: focusFlag.id,
                                        variableValue: {
                                            type: 'BOOLEAN',
                                            value: true,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };

            reactions.push(focusReaction);

            // Set all reactions at once for this variable
            await inputFrame.setReactionsAsync(reactions);
        }

        // Optionally close the plugin when done
        // figma.closePlugin();
    }

    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
