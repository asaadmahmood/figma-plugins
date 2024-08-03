var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const icons = {
    "": {
        "old": "",
        "new": "󰀏"
    },
    "": {
        "old": "",
        "new": "󰠁"
    },
    "": {
        "old": "",
        "new": "󰀝"
    },
    "": {
        "old": "",
        "new": "󰗖"
    },
    "": {
        "old": "",
        "new": "󰀪"
    },
    "": {
        "old": "",
        "new": "󱕷"
    },
    "󰈄": {
        "old": "󰈄",
        "new": "󰀻"
    },
    "󰊇": {
        "old": "󰊇",
        "new": "󱉜"
    },
    "": {
        "old": "",
        "new": "󱈎"
    },
    "": {
        "old": "",
        "new": "󰘕"
    },
    "": {
        "old": "",
        "new": "󰁅"
    },
    "": {
        "old": "",
        "new": "󰘖"
    },
    "": {
        "old": "",
        "new": "󰁍"
    },
    "": {
        "old": "",
        "new": "󰁝"
    },
    "": {
        "old": "",
        "new": "󰁥"
    },
    "": {
        "old": "",
        "new": "󰕋"
    },
    "敖": {
        "old": "敖",
        "new": "󰪑"
    },
    "": {
        "old": "",
        "new": "󰂜"
    },
    "": {
        "old": "",
        "new": "󰮠"
    },
    "": {
        "old": "",
        "new": "󰊭"
    },
    "": {
        "old": "",
        "new": "󰏆"
    },
    "ﴹ": {
        "old": "ﴹ",
        "new": "󰵝"
    },
    "": {
        "old": "",
        "new": "󰜺"
    },
    "": {
        "old": "",
        "new": "󱓭"
    },
    "": {
        "old": "",
        "new": "󰄜"
    },
    "": {
        "old": "",
        "new": "󰄨"
    },
    "": {
        "old": "",
        "new": "󰄪"
    },
    "": {
        "old": "",
        "new": "󰄬"
    },
    "": {
        "old": "",
        "new": "󰗠"
    },
    "": {
        "old": "",
        "new": "󰄱"
    },
    "": {
        "old": "",
        "new": "󰄲"
    },
    "": {
        "old": "",
        "new": "󰅀"
    },
    "﬌": {
        "old": "﬌",
        "new": "󰬧"
    },
    "": {
        "old": "",
        "new": "󰅁"
    },
    "": {
        "old": "",
        "new": "󰅂"
    },
    "": {
        "old": "",
        "new": "󰝦"
    },
    "肋": {
        "old": "肋",
        "new": "󰥔"
    },
    "": {
        "old": "",
        "new": "󰅐"
    },
    "": {
        "old": "",
        "new": "󰅖"
    },
    "": {
        "old": "",
        "new": "󰅚"
    },
    "": {
        "old": "",
        "new": "󰅪"
    },
    "": {
        "old": "",
        "new": "󰅴"
    },
    "": {
        "old": "",
        "new": "󰆍"
    },
    "󰃕": {
        "old": "󰃕",
        "new": "󱂪"
    },
    "": {
        "old": "",
        "new": "󰇘"
    },
    "": {
        "old": "",
        "new": "󰇙"
    },
    "ｦ": {
        "old": "ｦ",
        "new": "󰽉"
    },
    "": {
        "old": "",
        "new": "󰇰"
    },
    "匿": {
        "old": "匿",
        "new": "󰧬"
    },
    "": {
        "old": "",
        "new": "󰗰"
    },
    "": {
        "old": "",
        "new": "󰇵"
    },
    "": {
        "old": "",
        "new": "󰇲"
    },
    "": {
        "old": "",
        "new": "󱈸"
    },
    "": {
        "old": "",
        "new": "󰛐"
    },
    "ﹼ": {
        "old": "ﹼ",
        "new": ""
    },
    "󰁍": {
        "old": "󰁍",
        "new": "󱀫"
    },
    "󰁏": {
        "old": "󰁏",
        "new": "󱀭"
    },
    "ﻍ": {
        "old": "ﻍ",
        "new": "󰺰"
    },
    "": {
        "old": "",
        "new": ""
    },
    "ﹽ": {
        "old": "ﹽ",
        "new": ""
    },
    "󰁗": {
        "old": "󰁗",
        "new": "󱀵"
    },
    "吝": {
        "old": "吝",
        "new": "󰧮"
    },
    "︐": {
        "old": "︐",
        "new": "󰸬"
    },
    "󰁠": {
        "old": "󰁠",
        "new": "󱀾"
    },
    "": {
        "old": "",
        "new": "󰈶"
    },
    "": {
        "old": "",
        "new": "󰈸"
    },
    "": {
        "old": "",
        "new": "󰈻"
    },
    "": {
        "old": "",
        "new": "󰈽"
    },
    "": {
        "old": "",
        "new": "󰂖"
    },
    "": {
        "old": "",
        "new": "󰲄"
    },
    "": {
        "old": "",
        "new": "󰗲"
    },
    "": {
        "old": "",
        "new": "󰉤"
    },
    "": {
        "old": "",
        "new": "󰉥"
    },
    "": {
        "old": "",
        "new": "󰉫"
    },
    "": {
        "old": "",
        "new": "󰉬"
    },
    "": {
        "old": "",
        "new": "󰉭"
    },
    "": {
        "old": "",
        "new": "󰉮"
    },
    "": {
        "old": "",
        "new": "󰉯"
    },
    "": {
        "old": "",
        "new": "󰉰"
    },
    "": {
        "old": "",
        "new": "󰉷"
    },
    "﬙": {
        "old": "﬙",
        "new": "󰬴"
    },
    "": {
        "old": "",
        "new": "󰉹"
    },
    "": {
        "old": "",
        "new": "󰉻"
    },
    "": {
        "old": "",
        "new": "󰝗"
    },
    "": {
        "old": "",
        "new": "󰊁"
    },
    "": {
        "old": "",
        "new": "󰠢"
    },
    "": {
        "old": "",
        "new": "󰊤"
    },
    "": {
        "old": "",
        "new": "󰣪"
    },
    "": {
        "old": "",
        "new": "󰋕"
    },
    "": {
        "old": "",
        "new": "󰋖"
    },
    "掠": {
        "old": "掠",
        "new": "󰥶"
    },
    "": {
        "old": "",
        "new": "󰋽"
    },
    "": {
        "old": "",
        "new": "󰌢"
    },
    "什": {
        "old": "什",
        "new": "󰧾"
    },
    "": {
        "old": "",
        "new": "󰌪"
    },
    "": {
        "old": "",
        "new": "󰌶"
    },
    "": {
        "old": "",
        "new": "󰌹"
    },
    "": {
        "old": "",
        "new": "󰌺"
    },
    "": {
        "old": "",
        "new": "󰌾"
    },
    "": {
        "old": "",
        "new": "󰍁"
    },
    "": {
        "old": "",
        "new": "󰍉"
    },
    "": {
        "old": "",
        "new": "󰍜"
    },
    "": {
        "old": "",
        "new": "󰍝"
    },
    "": {
        "old": "",
        "new": "󰍵"
    },
    "": {
        "old": "",
        "new": "󰍶"
    },
    "﹬": {
        "old": "﹬",
        "new": "󰸌"
    },
    "": {
        "old": "",
        "new": "󰏢"
    },
    "ﲒ": {
        "old": "ﲒ",
        "new": "󰲶"
    },
    "": {
        "old": "",
        "new": "󰐃"
    },
    "擄": {
        "old": "擄",
        "new": "󰤱"
    },
    "": {
        "old": "",
        "new": "󰐕"
    },
    "": {
        "old": "",
        "new": "󰐖"
    },
    "": {
        "old": "",
        "new": "󱐥"
    },
    "": {
        "old": "",
        "new": "󰑐"
    },
    "］": {
        "old": "］",
        "new": "󰼠"
    },
    "": {
        "old": "",
        "new": "󱜙"
    },
    "": {
        "old": "",
        "new": "󰒊"
    },
    "󰆐": {
        "old": "󰆐",
        "new": "󱅥"
    },
    "": {
        "old": "",
        "new": "󰢻"
    },
    "": {
        "old": "",
        "new": "󰒙"
    },
    "": {
        "old": "",
        "new": "󰒪"
    },
    "": {
        "old": "",
        "new": "󰒸"
    },
    "": {
        "old": "",
        "new": "󰘬"
    },
    "": {
        "old": "",
        "new": "󰓂"
    },
    "": {
        "old": "",
        "new": "󰝤"
    },
    "": {
        "old": "",
        "new": "󰓎"
    },
    "": {
        "old": "",
        "new": "󰓒"
    },
    "": {
        "old": "",
        "new": "󰓦"
    },
    "": {
        "old": "",
        "new": "󰘮"
    },
    "﮸": {
        "old": "﮸",
        "new": "󰯜"
    },
    "": {
        "old": "",
        "new": "󰘯"
    }
};
const pages = figma.root.children;
const textItems = figma.currentPage.findAll(n => n.type === "TEXT");
const replaceText = () => __awaiter(this, void 0, void 0, function* () {
    let textItems = figma.currentPage.findAll(n => n.type === "TEXT");
    yield figma.loadFontAsync({ family: "compass-icons", style: "Regular" });
    const selectedNodes = figma.currentPage.selection;
    selectedNodes.forEach((selected) => {
        if ('findAll' in selected) {
            textItems = selected.findAll(node => node.type === "TEXT");
            textItems.forEach((item) => {
                if (!item) {
                    return;
                }
                if (item.type !== "TEXT") {
                    return;
                } // <----
                const oldChar = item.characters;
                if (oldChar in icons) {
                    item.fontName = { family: "compass-icons", style: "Regular" };
                    const newChar = icons[oldChar].new;
                    item.characters = newChar;
                }
            });
        }
    });
    figma.closePlugin();
});
// pages.forEach((page) => {
//     figma.currentPage = page;
//     replaceText();
// });
replaceText();
// for (const page in pages) {
//     if (!page) {
//         return;
//     }
//     if (page.type !== "STRING") {
//         return;
//     } // <----
//     // figma.currentPage = page as PageNode;
// }
// replaceText();
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
