var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const caretFrame = []; // Store inputFrame references
export function createCaretComponents() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the first frame with a visible caret
        const frameWithCaret = figma.createFrame();
        frameWithCaret.name = 'Frame with Caret';
        frameWithCaret.resize(100, 100);
        const caret = figma.createRectangle();
        caret.resize(2, 20);
        caret.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
        frameWithCaret.appendChild(caret);
        caretFrame.push(frameWithCaret);
        // Create the second frame without a visible caret
        const frameWithoutCaret = figma.createFrame();
        frameWithoutCaret.name = 'Frame without Caret';
        frameWithoutCaret.resize(100, 100);
        caretFrame.push(frameWithoutCaret);
        // Create components from the frames
        const componentWithCaret = figma.createComponent();
        componentWithCaret.name = 'Component with Caret';
        componentWithCaret.resize(100, 100);
        componentWithCaret.appendChild(frameWithCaret);
        const componentWithoutCaret = figma.createComponent();
        componentWithoutCaret.name = 'Component without Caret';
        componentWithoutCaret.resize(100, 100);
        componentWithoutCaret.appendChild(frameWithoutCaret);
        // Combine the components into a component set
        const componentSet = figma.combineAsVariants([componentWithCaret, componentWithoutCaret], figma.currentPage);
        componentSet.name = 'Caret Component Set';
        // Optionally, you can position the component set on the canvas
        componentSet.x = 100;
        componentSet.y = 100;
    });
}
// Call the function to create the components
createCaretComponents();
