export const fieldName = 'AMInput (Dont rename)';

// utils.js
interface FocusFlagPair {
    focusFlag: Variable;
    textVariable: Variable;
    placeholderVariable: Variable;
}

export function findTopMostFrame(node: SceneNode): FrameNode | null {
    let current = node;

    while (current.parent && current.parent.type === 'FRAME') {
        current = current.parent as FrameNode;
    }

    return current.type === 'FRAME' ? (current as FrameNode) : null;
}

// Function to find and store input frames
export function findInputFrames(
    node: SceneNode, // Use SceneNode here since it's a more general type
    inputFrames: FrameNode[] = [] // Ensure the array is of type FrameNode
): FrameNode[] {
    // Check if the node is a frame and has the name "Input Frame"
    if (node.type === 'FRAME' && node.name === fieldName) {
        inputFrames.push(node);
    }

    // Recursively check child nodes if the node can have children
    if ('children' in node) {
        for (const child of node.children) {
            // Ensure the child is a FrameNode before recursing
            if (child.type === 'FRAME') {
                findInputFrames(child, inputFrames);
            }
        }
    }

    return inputFrames;
}

export function findFocusFlag(
    variableFlag: FocusFlagPair[],
    textVariableId: string
) {
    for (const item of variableFlag) {
        if (item.textVariable.id === textVariableId) {
            return {
                focusFlagID: item.focusFlag.id,
                placeholderVariableID: item.placeholderVariable.id,
            };
        }
    }
    return null; // Return null if the textVariableId is not found
}

export async function getAllFocusFlags(
    collection: VariableCollection
): Promise<FocusFlagPair[]> {
    const focusFlagPairs: FocusFlagPair[] = [];
    const allVariables: Variable[] = [];

    // Fetch all variables once
    for (const variableId of collection.variableIds) {
        try {
            const variableObject = await figma.variables.getVariableByIdAsync(
                variableId
            );

            if (variableObject) {
                allVariables.push(variableObject);
            } else {
                console.warn(
                    `Variable with ID ${variableId} returned undefined or null.`
                );
            }
        } catch (error) {
            console.error(
                `Error fetching variable with ID ${variableId}:`,
                error
            );
        }
    }

    // Categorize variables
    const textVariables: { [key: string]: Variable } = {};
    const focusVariables: { [key: string]: Variable } = {};
    const placeholderVariables: { [key: string]: Variable } = {};

    for (const variable of allVariables) {
        if (variable.name.startsWith('TextVariable_')) {
            const identifier = variable.name.split('_')[1];
            textVariables[identifier] = variable;
        } else if (variable.name.startsWith('TextFieldFocus_')) {
            const identifier = variable.name.split('_')[1];
            focusVariables[identifier] = variable;
        } else if (variable.name.startsWith('TextFieldPlaceholder_')) {
            const identifier = variable.name.split('_')[1];
            placeholderVariables[identifier] = variable;
        }
    }

    // Pair the variables together
    for (const identifier in focusVariables) {
        const focusFlag = focusVariables[identifier];
        const textVariable = textVariables[identifier];
        const placeholderVariable = placeholderVariables[identifier];

        if (focusFlag && textVariable && placeholderVariable) {
            focusFlagPairs.push({
                focusFlag,
                textVariable,
                placeholderVariable,
            });
        } else {
            console.warn(
                `Missing variables for identifier ${identifier}: ` +
                    `TextVariable: ${textVariable ? 'found' : 'missing'}, ` +
                    `TextFieldPlaceholder: ${
                        placeholderVariable ? 'found' : 'missing'
                    }`
            );
        }
    }

    return focusFlagPairs;
}
