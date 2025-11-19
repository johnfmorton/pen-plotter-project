/**
 * Vitest setup file
 * Configures the test environment before running tests
 */

// Mock localStorage for testing
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    get length() {
        return Object.keys(this.store).length;
    }

    key(index) {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }
}

global.localStorage = new LocalStorageMock();

// Mock Monaco Editor for testing
global.monaco = {
    editor: {
        create: () => ({
            getValue: () => '',
            setValue: () => {},
            onDidChangeModelContent: () => ({ dispose: () => {} }),
            dispose: () => {},
            getModel: () => ({
                deltaDecorations: () => []
            })
        }),
        defineTheme: () => {},
        setTheme: () => {}
    },
    languages: {
        register: () => {},
        setMonarchTokensProvider: () => {}
    }
};

// Mock SVG.js for testing
global.SVG = () => {
    const mockSVG = {
        size: () => mockSVG,
        viewbox: () => ({ width: 8.5, height: 11 }),
        clear: () => mockSVG,
        svg: () => '<svg></svg>',
        circle: () => mockSVG,
        rect: () => mockSVG,
        line: () => mockSVG,
        polyline: () => mockSVG,
        polygon: () => mockSVG,
        path: () => mockSVG,
        text: () => mockSVG,
        group: () => mockSVG,
        fill: () => mockSVG,
        stroke: () => mockSVG,
        move: () => mockSVG,
        center: () => mockSVG,
        attr: () => mockSVG,
        addTo: () => mockSVG
    };
    return mockSVG;
};
