import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DEFAULT_STAGES, NOTIFICATION_SOUND } from './constants';
import type { Stage, CalculatedStage } from './types';

// --- Helper Functions ---
const formatTimeLeft = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatToLocalTime = (date: Date): string => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// --- SVG Icon Components ---
const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 17.66 1.41-1.41" /><path d="m17.66 4.93 1.41-1.41" /></svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);


// --- UI Components (defined outside App to prevent re-creation on re-renders) ---

interface CountdownDisplayProps {
  timeLeft: number;
  nextStageName: string | null;
}
const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ timeLeft, nextStageName }) => {
    return (
        <div className="text-center">
            <h2 className="text-xl md:text-2xl text-yellow-300 font-light mb-2">
                {nextStageName ? `זמן נותר עד ${nextStageName}` : 'הסתיים להיום'}
            </h2>
            <div className="text-7xl md:text-9xl font-mono font-bold text-white tracking-wider animate-pulse">
                {formatTimeLeft(timeLeft)}
            </div>
        </div>
    );
};

interface StagesListProps {
  stages: CalculatedStage[];
  nextStageIndex: number;
  sunriseTime: Date;
  isEditing: boolean;
  onToggleEdit: () => void;
  onStageUpdate: (index: number, newOffsets: Partial<Stage>) => void;
}
const StagesList: React.FC<StagesListProps> = ({ stages, nextStageIndex, sunriseTime, isEditing, onToggleEdit, onStageUpdate }) => {
    return (
        <div className="w-full max-w-md mt-10 bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700">
            <div className="flex justify-between items-center pb-3 border-b border-gray-600 mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-200" dir="rtl">זמני היום</h3>
                    <button onClick={onToggleEdit} className="text-xs font-bold py-1 px-3 rounded-md transition-colors bg-gray-700 hover:bg-gray-600 text-gray-200">
                        {isEditing ? 'סיום' : 'עריכה'}
                    </button>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                    <SunIcon className="w-5 h-5" />
                    <span className="font-mono">{formatToLocalTime(sunriseTime)}</span>
                </div>
            </div>
            <div className="space-y-2">
                {stages.map((stage, index) => (
                    <div
                        key={stage.name}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${index === nextStageIndex && !isEditing ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500' : 'bg-gray-800/60 text-gray-300'}`}
                        dir="rtl"
                    >
                        <span className="font-medium flex-shrink-0">{stage.name}</span>
                        {isEditing ? (
                            <div className="flex items-center gap-2 text-sm" dir="ltr">
                                <span className="text-gray-400 text-xs">לפני הנץ</span>
                                <input
                                    type="number"
                                    min="0"
                                    aria-label={`שניות עבור ${stage.name}`}
                                    value={stage.offsetSeconds !== undefined ? Math.abs(stage.offsetSeconds) : ''}
                                    placeholder="0"
                                    onChange={(e) => onStageUpdate(index, { offsetSeconds: -parseInt(e.target.value, 10) || 0 })}
                                    className="w-12 bg-gray-700 text-white rounded p-1 text-center font-mono"
                                />
                                <span className="text-gray-400">ש'</span>
                                <input
                                    type="number"
                                    min="0"
                                    aria-label={`דקות עבור ${stage.name}`}
                                    value={Math.abs(stage.offsetMinutes)}
                                    onChange={(e) => onStageUpdate(index, { offsetMinutes: -parseInt(e.target.value, 10) || 0 })}
                                    className="w-12 bg-gray-700 text-white rounded p-1 text-center font-mono"
                                />
                                <span className="text-gray-400">ד'</span>
                            </div>
                        ) : (
                            <span className="font-mono tracking-wider">{formatToLocalTime(stage.time)}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ManualTimeInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}
const ManualTimeInput: React.FC<ManualTimeInputProps> = ({ value, onChange, onSubmit }) => {
    return (
        <div className="mt-8 w-full max-w-md" dir="rtl">
            <label htmlFor="sunrise-time" className="block text-sm font-medium text-gray-400 mb-2">
                הזן שעת נץ ידנית
            </label>
            <div className="flex gap-2">
                <input
                    id="sunrise-time"
                    type="time"
                    value={value}
                    onChange={onChange}
                    className="bg-gray-800 border border-gray-600 text-white text-lg rounded-md block w-full p-2.5 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <button
                    onClick={onSubmit}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-md transition-colors"
                >
                    עדכן
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---

const STAGES_STORAGE_KEY = 'zmanim_stages';

const App: React.FC = () => {
    const [sunriseTime, setSunriseTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [manualSunriseInput, setManualSunriseInput] = useState<string>('');
    const [isEditingStages, setIsEditingStages] = useState(false);
    const [stages, setStages] = useState<Stage[]>(() => {
        try {
            const storedStages = localStorage.getItem(STAGES_STORAGE_KEY);
            if (storedStages) {
                return JSON.parse(storedStages);
            }
        } catch (error) {
            console.error("Failed to parse stages from localStorage", error);
        }
        return DEFAULT_STAGES;
    });

    const audioPlayer = useRef<HTMLAudioElement | null>(null);
    const playedNotifications = useRef<Set<string>>(new Set());

    useEffect(() => {
        try {
            localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(stages));
        } catch (error) {
            console.error("Failed to save stages to localStorage", error);
        }
    }, [stages]);

    useEffect(() => {
        audioPlayer.current = new Audio(NOTIFICATION_SOUND);
    }, []);

    const fetchSunriseTime = useCallback((lat: number, lon: number) => {
        const date = new Date().toISOString().split('T')[0];
        fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    const sunriseUTC = new Date(data.results.sunrise);
                    setSunriseTime(sunriseUTC);
                    setManualSunriseInput(sunriseUTC.toTimeString().substring(0, 5));
                    setError(null);
                } else {
                    setError('שגיאה בקבלת נתוני זריחה. נסה להזין ידנית.');
                }
            })
            .catch(() => setError('שגיאה ברשת. בדוק את החיבור ונסה שוב.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchSunriseTime(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                setError('נדרש אישור מיקום. ניתן להזין את שעת הנץ ידנית.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);
    
    useEffect(() => {
        // Reset played notifications if sunrise time changes (e.g., manual update)
        playedNotifications.current.clear();
    }, [sunriseTime]);

    const calculatedStages = useMemo<CalculatedStage[] | null>(() => {
        if (!sunriseTime) return null;
        return stages.map(stage => {
            const totalOffsetSeconds = (stage.offsetMinutes * 60) + (stage.offsetSeconds || 0);
            const stageTime = new Date(sunriseTime.getTime() + totalOffsetSeconds * 1000);
            return { ...stage, time: stageTime };
        });
    }, [sunriseTime, stages]);

    const { nextStage, nextStageIndex, timeLeft } = useMemo(() => {
        if (!calculatedStages) return { nextStage: null, nextStageIndex: -1, timeLeft: 0 };

        const now = currentTime.getTime();
        const futureStages = calculatedStages.filter(stage => stage.time.getTime() > now);

        if (futureStages.length === 0) {
            return { nextStage: null, nextStageIndex: -1, timeLeft: 0 };
        }

        const nextStage = futureStages[0];
        const nextStageIndex = calculatedStages.findIndex(s => s.name === nextStage.name);
        const timeLeft = nextStage.time.getTime() - now;
        
        return { nextStage, nextStageIndex, timeLeft };
    }, [currentTime, calculatedStages]);

    useEffect(() => {
        if (!calculatedStages || !audioPlayer.current) return;
    
        const now = currentTime.getTime();
    
        calculatedStages.forEach(stage => {
            const timeDiff = Math.abs(now - stage.time.getTime());
            if (timeDiff < 1000 && !playedNotifications.current.has(stage.name)) {
                audioPlayer.current?.play().catch(e => console.error("Error playing sound:", e));
                playedNotifications.current.add(stage.name);
            }
        });
    }, [currentTime, calculatedStages]);
    
    const handleManualTimeUpdate = () => {
        if (!manualSunriseInput) return;
        const [hours, minutes] = manualSunriseInput.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            setError("פורמט שעה לא תקין");
            return;
        }
        const now = new Date();
        const newSunrise = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        setSunriseTime(newSunrise);
        setError(null);
    };

    const handleStageUpdate = (index: number, newOffsets: Partial<Stage>) => {
        setStages(currentStages =>
            currentStages.map((stage, i) =>
                i === index ? { ...stage, ...newOffsets } : stage
            )
        );
    };

    if (loading) {
        return (
            <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans text-center" dir="rtl">
                <ClockIcon className="w-12 h-12 animate-spin mb-4 text-yellow-400" />
                <h1 className="text-2xl">מחשב זמני נץ...</h1>
                <p className="text-gray-400">מאתר את מיקומך כדי לקבוע את שעת הזריחה</p>
            </div>
        );
    }
    
    return (
        <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans text-center overflow-y-auto" dir="rtl">
            <main className="flex flex-col items-center justify-center flex-grow w-full">
                {error && !sunriseTime && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg mb-4">{error}</p>}
                
                {sunriseTime && calculatedStages ? (
                    <>
                        <CountdownDisplay timeLeft={timeLeft} nextStageName={nextStage?.name || null} />
                        <StagesList 
                            stages={calculatedStages} 
                            nextStageIndex={nextStageIndex} 
                            sunriseTime={sunriseTime}
                            isEditing={isEditingStages}
                            onToggleEdit={() => setIsEditingStages(prev => !prev)}
                            onStageUpdate={handleStageUpdate}
                        />
                    </>
                ) : (
                    <div className="text-center">
                        <SunIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold">הזן שעת נץ</h1>
                        <p className="text-gray-400 mt-2">לא ניתן היה לקבוע את שעת הנץ אוטומטית.</p>
                    </div>
                )}
    
                <ManualTimeInput
                    value={manualSunriseInput}
                    onChange={(e) => setManualSunriseInput(e.target.value)}
                    onSubmit={handleManualTimeUpdate}
                />
                 {error && sunriseTime && <p className="text-red-400 mt-4">{error}</p>}
            </main>
        </div>
    );
};

export default App;