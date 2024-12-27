import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { SketchPicker } from 'react-color';
import state from '../store/index.js';
import { fonts } from '../constants/fonts.js';

const defaultState = {
    frontText: 'Purecreate',
    frontTextPosition: [0, -0.04, 0.15],
    frontTextRotation: [0, 0, 0],
    frontTextScale: [0.15, 0.04, 0.1],
    frontTextFont: 'Arial',
    frontTextColor: 'gold',
    backText: 'Back Text',
    backTextPosition: [0, -0.04, -0.15],
    backTextRotation: [0, Math.PI, 0],
    backTextScale: [0.15, 0.04, 0.1],
    backTextFont: 'Purecreate',
    backTextColor: '#ffffff',
};



const Section = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-3">
            <div
                className="flex justify-between items-center bg-gray-300 p-2 rounded-md cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-bold">{title}</span>
                <span>{isOpen ? '-' : '+'}</span>
            </div>
            {isOpen && <div className="mt-2">{children}</div>}
        </div>
    );
};

const TextControls = () => {
    const snap = useSnapshot(state);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const saveState = () => {
        setUndoStack([...undoStack, { ...snap }]);
        setRedoStack([]); // Clear redo stack on new changes
    };

    const undo = () => {
        if (undoStack.length > 0) {
            const prevState = undoStack.pop();
            setRedoStack([snap, ...redoStack]);
            Object.assign(state, prevState); // Restore previous state
        }
    };

    const redo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack.shift();
            setUndoStack([...undoStack, snap]);
            Object.assign(state, nextState); // Restore next state
        }
    };

    const restoreDefault = () => {
        saveState();
        Object.assign(state, defaultState); // Reset to default
    };

    const handleStateChange = (type, property, value) => {
        saveState();
        if (type === 'front') {
            state[property] = value;
        } else if (type === 'back') {
            state[property] = value;
        }
    };

    const renderTransformControls = (type, label) => (
        <>
            <Section title={`${label} Position`}>
                {['X', 'Y', 'Z'].map((axis, index) => (
                    <div key={axis} className="flex items-center space-x-2">
                        <span>{axis}:</span>
                        <input
                            type="range"
                            min="-0.6"
                            max="0.6"
                            step="0.01"
                            value={snap[`${type}TextPosition`][index]}
                            onChange={(e) =>
                                handleStateChange(
                                    type,
                                    `${type}TextPosition`,
                                    snap[`${type}TextPosition`].map((pos, i) =>
                                        i === index ? parseFloat(e.target.value) : pos
                                    )
                                )
                            }
                            className="flex-grow"
                        />
                    </div>
                ))}
            </Section>
            <Section title={`${label} Rotation`}>
                {['RX', 'RY', 'RZ'].map((axis, index) => (
                    <div key={axis} className="flex items-center space-x-2">
                        <span>{axis}:</span>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={snap[`${type}TextRotation`][index]}
                            onChange={(e) =>
                                handleStateChange(
                                    type,
                                    `${type}TextRotation`,
                                    snap[`${type}TextRotation`].map((rot, i) =>
                                        i === index ? parseFloat(e.target.value) : rot
                                    )
                                )
                            }
                            className="flex-grow"
                        />
                    </div>
                ))}
            </Section>
            <Section title={`${label} Scale`}>
                {['SX', 'SY', 'SZ'].map((axis, index) => (
                    <div key={axis} className="flex items-center space-x-2">
                        <span>{axis}:</span>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.01"
                            value={snap[`${type}TextScale`][index]}
                            onChange={(e) =>
                                handleStateChange(
                                    type,
                                    `${type}TextScale`,
                                    snap[`${type}TextScale`].map((scale, i) =>
                                        i === index ? parseFloat(e.target.value) : scale
                                    )
                                )
                            }
                            className="flex-grow"
                        />
                    </div>
                ))}
            </Section>
        </>
    );

    return (
        <div className="absolute left-full ml-3 flex flex-col overflow-scroll space-y-4 w-72 max-h-96 p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 gap-2">
                <button
                    className="bg-gray-200 text-black px-5 py-1 rounded-lg shadow hover:bg-gray-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    title="Undo the last action"
                >
                    Undo
                </button>
                <button
                    className="bg-gray-200 text-black px-5 py-1 rounded-lg shadow hover:bg-gray-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    title="Redo the last undone action"
                >
                    Redo
                </button>
                <button
                    className="bg-red-500 text-white px-5 py-1 rounded-lg shadow-lg hover:bg-red-600 transition-all focus:ring-2 focus:ring-red-300 focus:outline-none"
                    onClick={restoreDefault}
                    title="Restore default settings"
                >
                    Reset
                </button>
            </div>


            <Section title="Front Text">
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <span>Text:</span>
                        <input
                            type="text"
                            className="border rounded p-1 w-full"
                            value={snap.frontText}
                            onChange={(e) =>
                                handleStateChange('front', 'frontText', e.target.value)
                            }
                        />
                    </label>
                    <label className="flex items-center space-x-2">
                        <span>Font:</span>
                        <select
                            className="border rounded p-1 w-full"
                            value={snap.frontTextFont}
                            onChange={(e) =>
                                handleStateChange('front', 'frontTextFont', e.target.value)
                            }
                        >
                            {fonts.map((font) => (
                                <option key={font} value={font}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center space-x-2">
                        <span>Color:</span>
                        <SketchPicker
                            color={snap.frontTextColor}
                            disableAlpha
                            onChange={(color) =>
                                handleStateChange('front', 'frontTextColor', color.hex)
                            }
                        />
                    </label>
                </div>
                {renderTransformControls('front', 'Front')}
            </Section>

            <Section title="Back Text">
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <span>Text:</span>
                        <input
                            type="text"
                            className="border rounded p-1 w-full"
                            value={snap.backText}
                            onChange={(e) =>
                                handleStateChange('back', 'backText', e.target.value)
                            }
                        />
                    </label>
                    <label className="flex items-center space-x-2">
                        <span>Font:</span>
                        <select
                            className="border rounded p-1 w-full"
                            value={snap.backTextFont}
                            onChange={(e) =>
                                handleStateChange('back', 'backTextFont', e.target.value)
                            }
                        >
                            {fonts.map((font) => (
                                <option key={font} value={font}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center space-x-2">
                        <span>Color:</span>
                        <SketchPicker
                            color={snap.backTextColor}
                            disableAlpha
                            onChange={(color) =>
                                handleStateChange('back', 'backTextColor', color.hex)
                            }
                        />
                    </label>
                </div>
                {renderTransformControls('back', 'Back')}
            </Section>
        </div>
    );
};

export default TextControls;