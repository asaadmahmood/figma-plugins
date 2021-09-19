// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

figma.ui.resize(500, 500);

interface dataObject {
    input: string;
    checked: Boolean;
}

interface myPaint {
    type: string;
    color: string;
}

// const fontArray = [
//   { family: "Roboto", style: "Regular" },
//   { family: "Roboto", style: "Bold" },
//   { family: "compass-icons", style: "Regular" },
// ];

// fontArray.map(async (font) => {
//   await figma.loadFontAsync(font);
// });

function turnFrameIntoComponent() {
    const progressPage: PageNode = figma.root.findChild(
        (n) => n.name === "✅ File Progress"
    );

    let items = [
        {
            state: 'false',
            text: "Create Figma File",
        },
        {
            state: 'false',
            text: "Create Spec",
        },
        {
            state: 'false',
            text: "Do Design",
        },
        {
            state: 'false',
            text: "Post in Spec Reviews",
        },
    ];


    if (progressPage) {
        const selection: SceneNode = progressPage.findChild(
            (n) => n.name === "Progress Checklist"
        );

        if (!selection) {
            return;
        }
        if (selection.type !== "FRAME") {
            return;
        } // <----

        items = [];

        for (const child of selection.children) {
            if (!child) {
                return;
            }
            if (child.type !== "FRAME") {
                return;
            } // <----

            items.push({
                state: child.children[0].name,
                text: child.children[1].name,
            });
        }
    }

    figma.ui.postMessage(items);
}

turnFrameIntoComponent();

figma.ui.onmessage = async (msg) => {
    const frameWidth = 600;
    const frameHeight = 600;

    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
    await figma.loadFontAsync({ family: "compass-icons", style: "Regular" });

    if (msg.type === "checklist") {
        const pages = figma.root.children;
        let pageNames = [];

        for (const value of Object.values(pages)) {
            pageNames.push(value.name);
        }

        if (!pageNames.includes("✅ File Progress")) {
            figma.createPage().name = "✅ File Progress";
        }

        const documentPage = figma.root.children.find(
            (n) => n.name === "✅ File Progress"
        );

        figma.currentPage = documentPage;

        for (const node of figma.currentPage.children) {
            node.locked = false;
            node.remove();
        }

        // Create the Main Frame
        const mainFrame = figma.createFrame();
        mainFrame.resizeWithoutConstraints(frameWidth, frameHeight);

        // Center the frame in our current viewport so we can see it.
        mainFrame.x = figma.viewport.center.x - frameWidth / 2;
        mainFrame.y = figma.viewport.center.y - frameHeight / 2;
        mainFrame.name = "Progress Checklist";
        mainFrame.layoutMode = "VERTICAL";
        mainFrame.verticalPadding = 32;
        mainFrame.horizontalPadding = 40;
        mainFrame.itemSpacing = 20;

        const nodes: SceneNode[] = [];

        Object.values(msg.data).forEach(async (val: dataObject) => {
            const checkFrame = figma.createFrame();

            checkFrame.layoutMode = "HORIZONTAL";
            checkFrame.counterAxisAlignItems = "CENTER";
            checkFrame.itemSpacing = 20;
            checkFrame.counterAxisSizingMode = "AUTO";

            // Creating Checklist Checkmark
            const checklistState = figma.createText();

            checklistState.name = val.checked.toString();
            checklistState.fontSize = 32;
            checklistState.fontName = {
                family: "compass-icons",
                style: "Regular",
            };
            const green: Paint[] = [
                {
                    color: {
                        r: 0,
                        g: 0.7,
                        b: 0.29,
                    },
                    type: "SOLID",
                },
            ];

            checklistState.fills = green;
            checklistState.characters = val.checked ? `` : ``;
            checkFrame.appendChild(checklistState);

            // Creating Checklist Text
            const checklistText = figma.createText();
            checklistText.name = val.input;
            checklistText.fontSize = 20;
            checklistText.characters = val.input;
            checkFrame.appendChild(checklistText);

            mainFrame.appendChild(checkFrame);
            nodes.push(mainFrame);
        });

        const titleText = figma.createText();
        titleText.fontSize = 40
        titleText.characters = 'File Progress Tracker'
        titleText.x = figma.viewport.center.x - frameWidth / 2;
        titleText.y = figma.viewport.center.y - frameHeight / 1.5;
        titleText.fontName = { family: "Roboto", style: "Bold" };

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
