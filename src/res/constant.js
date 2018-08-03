
export const app_constant = {
    Valign: {
        MIDDLE: "middle",
        TOP: "top",
        BOTTOM: "bottom",
        TEXT_TOP: "text-top",
        TEXT_BOTTOM: "text-bottom"
    },
    Align: {
        LEFT: "left",
        RIGHT: "right",
        CENTER: "center"
    },
    TextAlign: {
        CENTER: "center",
        LEFT: "left",
        RIGHT: "right"
    },
    ImageScale: {
        AUTO: 0,
        FILL_WIDTH: 1,
        FILL_HEIGHT: 2,
        FILL_BOTH: 3,
        CENTER_INSIDE: 4,
        COVER: 5
    },
    Text: {
        key: "span"
    },
    Button: {
        key: "a"
    },
    Block: {
        key: "div"
    },
    List: {
        parentKey: "ul",
        ChildKey: "li"
    },
    Date: {
        key: "input",
        type: "date"
    },
    Visibility: {
        VISIBLE: 0,
        INVISIBLE: 1,
        GONE: 2
    },
    BoxSizing: {
        border: "border-box",
        content: "content-box"
    },
    Float: {
        LEFT: "left",
        RIGHT: "right",
        BOTH: "both",
        NONE: "none"
    },
    Gravity: {
        TOP_LEFT: 1,
        TOP_CENTER: 2,
        TOP_RIGHT: 3,
        BOTTOM_LEFT: 4,
        BOTTOM_CENTER: 5,
        BOTTOM_RIGHT: 6,
        INSIDE_BOTTOM_RIGHT: 7,
        CENTER_LEFT: 8,
        CENTER_RIGHT: 9,
        CENTER: 10

    },
    Display: {
        BLOCK: "block",
        INLINE_BLOCK: "inline-block",
        FLEX: "flex",
        INLINE_FLEX: "inline-flex"
    },
    Position: {
        RELATIVE: 1,
        ABSOLUTE: 2,
        FIXED: 3,
        STATIC: 4
    },
    Cursor: {
        POINTER: "pointer"
    },
    Size: {
        WRAP_CONTENT: -1,
        FILL_PARENT: -2,
        AUTO: "auto"
    },
    DATE_FORMAT: {
        DAY_MONTH_YEAR: "dd/MM/yyyy",
        YEAR_MONTH_DATE: "yyyy/MM/dd",
        MONTH_DAY_YEAR: "MM/dd/yyyy"
    },
    VIEW_STATE: {
        destroy: 0,
        running: 1,
        pause: 2,
        undefined: -1,
        renderring: 3,
        orderring: 4
    },
    ScrollType: {
        NONE: 0,
        VERTICAL: 1,
        HORIZONTAL: 2
    },
    Orientation:{
        HORIZONTAL: 1,
        VERTICAL: 2
    },
    Direction:{
        LEFT: 0,
        RIGHT: 1,
        TOP: 2,
        BOTTOM: 3
    },
    SIZE_UNIT: "px"
}

export const app_duration = {
    LONG_CLICK: 600
}

export const app_animation = {
    DESTROY: "scaleClose90",
    STICKY_LAYOUT_SHOW: "scaleOpen90",
    STICKY_LAYOUT_HIDE: "scaleClose90"
}