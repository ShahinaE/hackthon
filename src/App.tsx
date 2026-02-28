import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Brain, 
  Plus, 
  History, 
  TrendingUp, 
  Utensils, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Target,
  Mail,
  Lock,
  User as UserIcon,
  LogOut,
  ArrowRight,
  Calendar,
  Award,
  Clock,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Volume2,
  AlertTriangle,
  Activity,
  ListChecks,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMeal, getDailySummary, generateDietPlan, generateVoiceAlert, analyzeDietaryPatterns, generateCorrectiveTask, type MealAnalysis, type UserProfile, type DietPlan, type DietaryPattern, type CorrectiveTask } from './services/geminiService';
import { getNutritionByBarcode } from './services/nutritionService';
import { Html5Qrcode } from 'html5-qrcode';
import { format, startOfDay, isSameDay, differenceInDays, addDays } from 'date-fns';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import ReactMarkdown from 'react-markdown';

interface Meal {
  id: string;
  timestamp: Date;
  description: string;
  analysis: MealAnalysis;
}

interface User {
  name: string;
  email: string;
}

function Onboarding({ onComplete, initialData }: { onComplete: (profile: UserProfile) => void, initialData?: UserProfile }) {
  const [isEditing, setIsEditing] = useState(!initialData);
  const [profile, setProfile] = useState<UserProfile>(initialData || {
    issue: '',
    habits: '',
    preference: '',
    isSmoker: 'non-smoker',
    isAlcoholic: 'non-alcoholic',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-12 px-6"
    >
      <div className="glass-panel p-8 space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-neuro-accent/20 rounded-xl flex items-center justify-center border border-neuro-accent/30 mx-auto mb-4">
            <Target className="w-6 h-6 text-neuro-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Personalize Your Experience' : 'Your Health Profile'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isEditing ? 'Tell us more about your health goals and lifestyle.' : 'Review your current health and lifestyle settings.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">1. What is your main health issue or goal?</label>
            <textarea
              required
              disabled={!isEditing}
              value={profile.issue}
              onChange={(e) => setProfile({ ...profile, issue: e.target.value })}
              placeholder="e.g., Weight loss, managing blood sugar, improving energy levels..."
              className="w-full neuro-input min-h-[80px] resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">2. Describe your regular food intake habits</label>
            <textarea
              required
              disabled={!isEditing}
              value={profile.habits}
              onChange={(e) => setProfile({ ...profile, habits: e.target.value })}
              placeholder="e.g., Skip breakfast, heavy late-night snacking, high caffeine intake..."
              className="w-full neuro-input min-h-[80px] resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">3. Your diet food preferences</label>
            <textarea
              required
              disabled={!isEditing}
              value={profile.preference}
              onChange={(e) => setProfile({ ...profile, preference: e.target.value })}
              placeholder="e.g., Vegetarian, Keto, high protein, no dairy..."
              className="w-full neuro-input min-h-[80px] resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase">4. Smoking Status</label>
              <select
                disabled={!isEditing}
                value={profile.isSmoker}
                onChange={(e) => setProfile({ ...profile, isSmoker: e.target.value })}
                className="w-full neuro-input disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="non-smoker">Non-Smoker</option>
                <option value="smoker">Smoker</option>
                <option value="occasional">Occasional Smoker</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase">5. Alcohol Consumption</label>
              <select
                disabled={!isEditing}
                value={profile.isAlcoholic}
                onChange={(e) => setProfile({ ...profile, isAlcoholic: e.target.value })}
                className="w-full neuro-input disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="non-alcoholic">Non-Alcoholic</option>
                <option value="alcoholic">Regular Consumer</option>
                <option value="social">Social Drinker</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase">6. Phone Number (for SMS Alerts)</label>
              <input
                type="tel"
                required
                disabled={!isEditing}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="e.g., +1234567890"
                className="w-full neuro-input disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {isEditing ? (
            <button type="submit" className="w-full neuro-button py-4 text-lg mt-4">
              {initialData ? 'Save Changes' : 'Complete Profile & Enter Dashboard'}
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors mt-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </form>
      </div>
    </motion.div>
  );
}

function Auth({ onLogin }: { onLogin: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onLogin({ name: isLogin ? 'User' : name, email });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neuro-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-neuro-accent/20 rounded-2xl flex items-center justify-center border border-neuro-accent/30 mb-4">
            <Brain className="w-10 h-10 text-neuro-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">NeuroPlate</h1>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin ? 'Welcome back to your neuro-journey' : 'Start your path to food discipline'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full glass-input pl-12"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full glass-input pl-12"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full neuro-button py-4 mt-4 flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-neuro-accent transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileModal({ user, profile, isOpen, onClose }: { user: User, profile: UserProfile, isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass-panel p-8 relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-neuro-accent" />
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neuro-accent/10 rounded-full flex items-center justify-center border border-neuro-accent/20">
                  <UserIcon className="w-8 h-8 text-neuro-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                  <p className="text-slate-500">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Goal / Issue</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.issue}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Food Habits</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-white/10">{profile.habits}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diet Preference</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-white/10">{profile.preference}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smoking</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-white/10 capitalize">{profile.isSmoker}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alcohol</p>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-white/10 capitalize">{profile.isAlcoholic}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-white/10">{profile.phone || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={onClose}
                className="neuro-button"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function BarcodeScannerModal({ isOpen, onClose, onScan }: { isOpen: boolean, onClose: () => void, onScan: (barcode: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("barcode-reader");
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 150 }
            },
            (decodedText) => {
              if (isMounted) {
                onScan(decodedText);
                stopScanner();
                onClose();
              }
            },
            () => {
              // Ignore failures
            }
          );
        } catch (err) {
          if (isMounted) {
            console.error("Barcode scanner error:", err);
            setError("Could not access camera for barcode scanning.");
          }
        }
      };
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass-panel p-6 relative z-10 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neuro-accent" />
                Scan Barcode
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-6">
              <div id="barcode-reader" className="w-full h-full"></div>
              <div className="absolute inset-0 border-2 border-neuro-accent/50 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-40 border-2 border-neuro-accent rounded-lg"></div>
              </div>
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
                  <p className="text-white text-sm">{error}</p>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-500">
              Position the barcode within the frame to scan automatically.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CameraModal({ isOpen, onClose, onCapture }: { isOpen: boolean, onClose: () => void, onCapture: (image: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        onCapture(imageData);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-black rounded-3xl overflow-hidden relative z-10 shadow-2xl"
          >
            <div className="relative aspect-[3/4] bg-slate-900 flex items-center justify-center">
              {error ? (
                <div className="p-8 text-center text-white">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-500" />
                  <p>{error}</p>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              )}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-900 flex justify-center items-center gap-8">
              <button 
                onClick={capturePhoto}
                disabled={!!error}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-full group-hover:scale-90 transition-transform" />
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [registrationDate, setRegistrationDate] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailySummary, setDailySummary] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'profile' | 'plan'>('log');
  const [dietaryPatterns, setDietaryPatterns] = useState<DietaryPattern[]>([]);
  const [isAnalyzingPatterns, setIsAnalyzingPatterns] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<CorrectiveTask[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for missed meals and analyze patterns
  useEffect(() => {
    if (meals.length > 0 && userProfile) {
      const interval = setInterval(() => {
        checkForMissedMeals();
      }, 60000); // Check every minute
      
      if (meals.length >= 3 && dietaryPatterns.length === 0) {
        handleAnalyzePatterns();
      }
      
      return () => clearInterval(interval);
    }
  }, [meals, userProfile]);

  const handleAnalyzePatterns = async () => {
    if (!userProfile || meals.length < 3) return;
    setIsAnalyzingPatterns(true);
    try {
      const patterns = await analyzeDietaryPatterns(meals, userProfile);
      setDietaryPatterns(patterns);
    } catch (error) {
      console.error("Pattern analysis failed:", error);
    } finally {
      setIsAnalyzingPatterns(false);
    }
  };

  const playVoiceAlert = async (message: string) => {
    const base64Audio = await generateVoiceAlert(message);
    
    // Send Real-time SMS Alert
    if (userProfile?.phone) {
      try {
        await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userProfile.phone,
            message,
            userName: user?.name || 'User'
          })
        });
        console.log("Real-time SMS alert sent to:", userProfile.phone);
      } catch (error) {
        console.error("Failed to send real-time SMS alert:", error);
      }
    }

    if (base64Audio) {
      const audioSrc = `data:audio/pcm;base64,${base64Audio}`;
      // In a real environment, we'd need to convert PCM to a playable format or use Web Audio API
      // For this demo, we'll simulate the alert with a visual notification if audio fails
      console.log("Voice Alert:", message);
      // Create a blob and play it
      const audioBlob = await (await fetch(`data:audio/wav;base64,${base64Audio}`)).blob();
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  };

  const checkForMissedMeals = async () => {
    const now = new Date();
    const hours = now.getHours();
    const todayStr = format(now, 'yyyy-MM-dd');
    
    // Simple logic: check if a meal was logged in specific windows
    const todayMeals = meals.filter(m => isSameDay(new Date(m.timestamp), now));
    
    let missedMeal = "";
    if (hours >= 11 && hours < 12 && !todayMeals.some(m => m.description.toLowerCase().includes('breakfast'))) {
      missedMeal = "breakfast";
    } else if (hours >= 15 && hours < 16 && !todayMeals.some(m => m.description.toLowerCase().includes('lunch'))) {
      missedMeal = "lunch";
    } else if (hours >= 21 && hours < 22 && !todayMeals.some(m => m.description.toLowerCase().includes('dinner'))) {
      missedMeal = "dinner";
    }

    if (missedMeal && lastAlertTime !== `${todayStr}-${missedMeal}`) {
      const message = `Attention! You haven't logged your ${missedMeal} yet. Staying consistent is key to your ${userProfile?.issue || 'health'} goals. Please log your meal now.`;
      playVoiceAlert(message);
      setLastAlertTime(`${todayStr}-${missedMeal}`);

      // Generate Corrective Task
      if (userProfile) {
        try {
          const task = await generateCorrectiveTask(missedMeal, userProfile);
          setPendingTasks(prev => {
            const updated = [task, ...prev];
            localStorage.setItem('neuroplate_tasks', JSON.stringify(updated));
            return updated;
          });
        } catch (error) {
          console.error("Failed to generate corrective task:", error);
        }
      }
    }
  };

  const completeTask = (taskId: string) => {
    setPendingTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t);
      localStorage.setItem('neuroplate_tasks', JSON.stringify(updated));
      return updated;
    });
  };
  useEffect(() => {
    const savedUser = localStorage.getItem('neuroplate_user');
    const savedProfile = localStorage.getItem('neuroplate_profile');
    const savedPlan = localStorage.getItem('neuroplate_plan');
    const savedRegDate = localStorage.getItem('neuroplate_reg_date');
    const savedTasks = localStorage.getItem('neuroplate_tasks');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedPlan) setDietPlan(JSON.parse(savedPlan));
    if (savedRegDate) setRegistrationDate(savedRegDate);
    if (savedTasks) setPendingTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    if (registrationDate && dietPlan && activeTab === 'plan') {
      const daysSinceReg = differenceInDays(new Date(), new Date(registrationDate));
      const todayIndex = Math.min(6, Math.max(0, daysSinceReg));
      setCurrentDayIndex(todayIndex);
    }
  }, [registrationDate, dietPlan, activeTab]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    const regDate = new Date().toISOString();
    setRegistrationDate(regDate);
    localStorage.setItem('neuroplate_user', JSON.stringify(userData));
    localStorage.setItem('neuroplate_reg_date', regDate);
  };

  const handleProfileComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('neuroplate_profile', JSON.stringify(profile));
    
    // Generate diet plan automatically
    setIsGeneratingPlan(true);
    try {
      const plan = await generateDietPlan(profile);
      setDietPlan(plan);
      localStorage.setItem('neuroplate_plan', JSON.stringify(plan));

      // Send Diet Plan SMS
      if (profile.phone) {
        fetch('/api/send-diet-plan-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: profile.phone,
            planTitle: plan.title,
            userName: user?.name || 'User',
            schedule: plan.weeklySchedule
          })
        }).catch(err => console.error("Diet Plan SMS failed:", err));
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserProfile(null);
    setDietPlan(null);
    setRegistrationDate(null);
    localStorage.removeItem('neuroplate_user');
    localStorage.removeItem('neuroplate_profile');
    localStorage.removeItem('neuroplate_plan');
    localStorage.removeItem('neuroplate_reg_date');
  };

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayMeals = meals.filter(m => new Date(m.timestamp).setHours(0, 0, 0, 0) === today);
    
    const totals = todayMeals.reduce((acc, m) => ({
      calories: acc.calories + m.analysis.calories,
      protein: acc.protein + m.analysis.protein,
      carbs: acc.carbs + m.analysis.carbs,
      fat: acc.fat + m.analysis.fat,
      score: acc.score + m.analysis.disciplineScore
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, score: 0 });

    const avgScore = todayMeals.length > 0 ? (totals.score / todayMeals.length).toFixed(1) : '0';

    return { totals, avgScore, count: todayMeals.length };
  }, [meals]);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !capturedImage) || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const history = meals.slice(-5).map(m => m.description);
      const analysis = await analyzeMeal(input, history, userProfile || undefined, capturedImage || undefined);
      
      const newMeal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        description: input || "Photo Logged Meal",
        analysis
      };

      setMeals(prev => [newMeal, ...prev]);
      setInput('');
      setCapturedImage(null);
      
      // Update summary
      const summary = await getDailySummary([newMeal, ...meals]);
      setDailySummary(summary);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setIsAnalyzing(true);
    try {
      const nutrition = await getNutritionByBarcode(barcode);
      if (!nutrition) {
        alert("Product not found in database.");
        return;
      }

      const history = meals.slice(-5).map(m => m.description);
      const description = `Scanned Product: ${nutrition.name}`;
      const analysis = await analyzeMeal(description, history, userProfile || undefined);
      
      const newMeal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        description: description,
        analysis: {
          ...analysis,
          // Ensure database match is included
          databaseMatches: [nutrition, ...(analysis.databaseMatches || [])]
        }
      };

      setMeals(prev => [newMeal, ...prev]);
      
      // Update summary
      const summary = await getDailySummary([newMeal, ...meals]);
      setDailySummary(summary);
    } catch (error) {
      console.error("Barcode analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const macroData = [
    { name: 'Protein', value: stats.totals.protein, color: '#10B981' },
    { name: 'Carbs', value: stats.totals.carbs, color: '#3B82F6' },
    { name: 'Fat', value: stats.totals.fat, color: '#F59E0B' },
  ];

  const performanceData = useMemo(() => {
    const days = meals.reduce((acc: any, meal) => {
      const date = format(meal.timestamp, 'MMM dd');
      if (!acc[date]) acc[date] = { date, score: 0, count: 0 };
      acc[date].score += meal.analysis.disciplineScore;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(days).map((day: any) => ({
      date: day.date,
      score: Math.round(day.score / day.count * 10) / 10
    }));
  }, [meals]);

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-neuro-border px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neuro-accent/20 rounded-xl flex items-center justify-center border border-neuro-accent/30">
                <Brain className="w-6 h-6 text-neuro-accent" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">NeuroPlate</h1>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <Onboarding onComplete={handleProfileComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neuro-bg/80 backdrop-blur-md border-b border-neuro-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('log')}
              className="w-10 h-10 bg-neuro-accent/20 rounded-xl flex items-center justify-center border border-neuro-accent/30 hover:bg-neuro-accent/30 transition-colors"
              title="Home"
            >
              <Brain className="w-6 h-6 text-neuro-accent" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">NeuroPlate</h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Diet Nudge AI</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Real-time Sync Active</span>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase font-bold">Discipline Score</span>
              <span className="text-lg font-mono text-neuro-accent font-bold">{stats.avgScore}/10</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-100 rounded-full transition-all group"
            >
              <div className="w-8 h-8 bg-neuro-accent/10 rounded-full flex items-center justify-center border border-neuro-accent/20 group-hover:bg-neuro-accent group-hover:text-white transition-colors">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">View Profile</p>
              </div>
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-rose-500"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <ProfileModal 
        user={user} 
        profile={userProfile} 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(img) => setCapturedImage(img)} 
      />

      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />

      <audio ref={audioRef} className="hidden" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'log', label: 'Home', icon: Utensils },
            { id: 'plan', label: 'Diet Plan', icon: Calendar },
            { id: 'stats', label: 'Performance', icon: TrendingUp },
            { id: 'profile', label: 'Health Profile', icon: UserIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-neuro-accent text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/50 text-slate-500 hover:bg-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' ? (
          <div className="max-w-3xl mx-auto">
            <Onboarding onComplete={handleProfileComplete} initialData={userProfile || undefined} />
            {isGeneratingPlan && (
              <div className="mt-8 glass-panel p-6 flex items-center justify-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-neuro-accent" />
                <p className="text-slate-600 font-medium">Generating your personalized neuro-diet plan...</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">Updating your profile will help the AI provide more personalized behavioral nudges.</p>
            </div>
          </div>
        ) : activeTab === 'plan' ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {!dietPlan ? (
              <div className="glass-panel p-12 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Complete your Health Profile to generate a personalized diet plan.</p>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="mt-6 neuro-button"
                >
                  Go to Profile
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass-panel p-8 bg-gradient-to-br from-emerald-50 to-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{dietPlan.title}</h2>
                      <p className="text-slate-500 mt-1">Estimated Duration: {dietPlan.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setActiveTab('log'); setIsCameraOpen(true); }}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-neuro-border flex items-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="w-5 h-5 text-neuro-accent" />
                        <span className="text-sm font-bold text-slate-700">Camera</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('log'); fileInputRef.current?.click(); }}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-neuro-border flex items-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-neuro-accent" />
                        <span className="text-sm font-bold text-slate-700">Upload</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (!userProfile?.phone) {
                            alert("Please add your phone number in the Profile tab first!");
                            return;
                          }
                          if (!dietPlan) {
                            alert("Diet plan is still generating. Please wait a moment.");
                            return;
                          }

                          try {
                            const currentDay = dietPlan.weeklySchedule[currentDayIndex];
                            const breakfast = currentDay.meals.breakfast.main;
                            const message = `Good morning ${user?.name || 'User'}! It's time for your morning diet. Today's Breakfast: ${breakfast}. Stay disciplined and follow your plan!`;
                            
                            const response = await fetch('/api/send-sms', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                phone: userProfile.phone,
                                message,
                                userName: user?.name || 'User'
                              })
                            });

                            const result = await response.json();
                            if (response.ok) {
                              if (result.simulated) {
                                alert(`SMS Simulated!\nTo: ${result.debug?.to}\nMessage: ${result.debug?.body}\n\n(Configure Twilio in .env to send real SMS)`);
                              } else {
                                alert("Morning diet nudge sent to your phone!");
                              }
                            } else {
                              alert(`Failed to send SMS: ${result.error || 'Unknown error'}`);
                            }
                          } catch (err) {
                            console.error("SMS failed:", err);
                            alert("Network error while sending SMS.");
                          }
                        }}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-neuro-border flex items-center gap-2 hover:bg-slate-50 transition-colors"
                        title="Send Morning Diet Nudge"
                      >
                        <Volume2 className="w-5 h-5 text-neuro-accent" />
                        <span className="text-sm font-bold text-slate-700">SMS Morning Diet</span>
                      </button>
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-neuro-border flex items-center gap-2">
                        <Award className="w-5 h-5 text-neuro-accent" />
                        <span className="text-sm font-bold text-slate-700">Goal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-neuro-accent" />
                    <span className="font-bold text-slate-700 uppercase tracking-widest text-xs">Weekly Roadmap</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {dietPlan.weeklySchedule ? (
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-neuro-accent" />
                          Daily Schedule
                        </h3>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentDayIndex === 0}
                            className="p-2 bg-white rounded-full shadow-sm border border-neuro-border disabled:opacity-30 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-sm font-bold text-slate-700 w-20 text-center">
                            Day {currentDayIndex + 1} of 7
                          </span>
                          <button 
                            onClick={() => setCurrentDayIndex(prev => Math.min(6, prev + 1))}
                            disabled={currentDayIndex === 6}
                            className="p-2 bg-white rounded-full shadow-sm border border-neuro-border disabled:opacity-30 hover:bg-slate-50 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentDayIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="glass-panel overflow-hidden"
                        >
                          <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                            <div className="flex flex-col">
                              <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                                {dietPlan.weeklySchedule[currentDayIndex].day}
                              </h3>
                              <p className="text-emerald-400 text-[10px] font-mono mt-0.5">
                                {registrationDate ? format(addDays(new Date(registrationDate), currentDayIndex), 'EEEE, MMMM do') : 'Today'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                              <CheckCircle2 className="w-3 h-3" />
                              OPTIMIZED
                            </div>
                          </div>
                          
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
                              <div key={mealType} className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                  <Utensils className="w-3 h-3 text-neuro-accent" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{mealType}</span>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-700 mb-1">Main Option</p>
                                    <p className="text-sm text-slate-700 leading-tight">{dietPlan.weeklySchedule[currentDayIndex].meals[mealType].main}</p>
                                  </div>
                                  
                                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-700 mb-1">Alternative</p>
                                    <p className="text-sm text-slate-700 leading-tight">{dietPlan.weeklySchedule[currentDayIndex].meals[mealType].alternative}</p>
                                  </div>

                                  <div className="flex items-center gap-1.5 px-1">
                                    <TrendingUp className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] text-slate-500 font-mono">{dietPlan.weeklySchedule[currentDayIndex].meals[mealType].nutrition}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="glass-panel p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Plan Format Updated</h3>
                      <p className="text-slate-500 mb-6">Your diet plan is in an older format. Please regenerate it to see your new weekly schedule with alternatives.</p>
                      <button 
                        onClick={() => userProfile && handleProfileComplete(userProfile)}
                        disabled={isGeneratingPlan}
                        className="neuro-button flex items-center gap-2 mx-auto"
                      >
                        {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Regenerate Weekly Plan
                      </button>
                    </div>
                  )}
                </div>

                <div className="glass-panel p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neuro-accent" />
                    Key Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dietPlan.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Input & History */}
            <div className="lg:col-span-7 space-y-8">
              {activeTab === 'log' ? (
                <>
                  {/* Journey Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Day</p>
                        <p className="text-lg font-bold text-slate-900">
                          {registrationDate ? differenceInDays(new Date(), new Date(registrationDate)) + 1 : 1}
                        </p>
                      </div>
                    </div>
                    <div className="glass-panel p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</p>
                        <p className="text-lg font-bold text-slate-900">{stats.avgScore}</p>
                      </div>
                    </div>
                    <div className="glass-panel p-4 hidden md:flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
                        <p className="text-lg font-bold text-slate-900">3 Days</p>
                      </div>
                    </div>
                  </div>
                  {/* Input Section */}
                  <section className="glass-panel p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-neuro-accent" />
                        Log Your Meal
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsCameraOpen(true)}
                          className="p-2 bg-slate-100 hover:bg-neuro-accent/10 text-slate-600 hover:text-neuro-accent rounded-lg transition-colors"
                          title="Take Photo"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setIsBarcodeScannerOpen(true)}
                          className="p-2 bg-slate-100 hover:bg-neuro-accent/10 text-slate-600 hover:text-neuro-accent rounded-lg transition-colors"
                          title="Scan Barcode"
                        >
                          <Zap className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-slate-100 hover:bg-neuro-accent/10 text-slate-600 hover:text-neuro-accent rounded-lg transition-colors"
                          title="Upload Photo"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>
                    </h2>

                    {capturedImage && (
                      <div className="mb-4 relative w-full aspect-video rounded-2xl overflow-hidden border border-neuro-border group">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setCapturedImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleAddMeal} className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={capturedImage ? "Add a description (optional)..." : "What did you eat? (e.g., Grilled salmon with quinoa and broccoli)"}
                          className="w-full neuro-input min-h-[100px] resize-none pt-4"
                        />
                        <button
                          type="submit"
                          disabled={isAnalyzing || (!input.trim() && !capturedImage)}
                          className="absolute bottom-4 right-4 neuro-button flex items-center gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Analyze
                        </button>
                      </div>
                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-[10px] text-neuro-accent font-bold animate-pulse px-2">
                          <Activity className="w-3 h-3" />
                          QUERYING NUTRITIONAL DATABASE...
                        </div>
                      )}
                      <p className="text-xs text-slate-400 italic">
                        AI will analyze nutritional content and provide behavioral feedback.
                      </p>
                    </form>
                  </section>

                  {/* History Section */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 px-2">
                      <History className="w-5 h-5 text-slate-400" />
                      Recent Patterns
                    </h2>
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {meals.length === 0 ? (
                          <div className="glass-panel p-12 text-center text-slate-400">
                            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No meals logged yet. Start your journey today.</p>
                          </div>
                        ) : (
                          meals.map((meal) => (
                            <motion.div
                              key={meal.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="glass-panel overflow-hidden"
                            >
                              <div className="p-5 border-b border-neuro-border flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-slate-900">{meal.description}</p>
                                  <p className="text-xs text-slate-400 mt-1">{format(meal.timestamp, 'h:mm a')}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                                  meal.analysis.disciplineScore >= 8 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                  meal.analysis.disciplineScore >= 5 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}>
                                  SCORE: {meal.analysis.disciplineScore}/10
                                </div>
                              </div>
                              <div className="p-5 bg-slate-50/50 grid grid-cols-4 gap-4 text-center border-b border-neuro-border">
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Calories</p>
                                  <p className="text-sm font-mono font-bold">{meal.analysis.calories}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Protein</p>
                                  <p className="text-sm font-mono font-bold">{meal.analysis.protein}g</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Carbs</p>
                                  <p className="text-sm font-mono font-bold">{meal.analysis.carbs}g</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">Fat</p>
                                  <p className="text-sm font-mono font-bold">{meal.analysis.fat}g</p>
                                </div>
                              </div>
                              <div className="p-5 space-y-4">
                                {meal.analysis.databaseMatches && meal.analysis.databaseMatches.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                      <ListChecks className="w-3 h-3" />
                                      Database Matches
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {meal.analysis.databaseMatches.map((match, idx) => (
                                        <div key={idx} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded flex flex-col">
                                          <span className="font-bold truncate max-w-[150px]">{match.name}</span>
                                          <span>{match.calories} kcal | P:{match.protein}g</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-3">
                                  <Brain className="w-5 h-5 text-neuro-accent shrink-0 mt-1" />
                                  <p className="text-sm text-slate-600 italic">"{meal.analysis.nudge}"</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Better Alternatives</p>
                                  <div className="flex flex-wrap gap-2">
                                    {meal.analysis.alternatives.map((alt, idx) => (
                                      <span key={idx} className="text-xs bg-neuro-accent/5 text-neuro-accent border border-neuro-accent/20 px-2 py-1 rounded-md">
                                        {alt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                </>
              ) : (
                <div className="space-y-8">
                  {/* AI Pattern Insights */}
                  <section className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neuro-accent" />
                        AI Pattern Insights
                      </h2>
                      <button 
                        onClick={handleAnalyzePatterns}
                        disabled={isAnalyzingPatterns || meals.length < 3}
                        className="text-xs font-bold text-neuro-accent hover:underline flex items-center gap-1"
                      >
                        {isAnalyzingPatterns ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Refresh Analysis
                      </button>
                    </div>

                    {meals.length < 3 ? (
                      <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Log at least 3 meals to unlock deep pattern analysis.</p>
                      </div>
                    ) : isAnalyzingPatterns ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {dietaryPatterns.map((pattern, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-5 rounded-2xl border ${
                              pattern.riskLevel === 'high' ? 'bg-rose-50 border-rose-100' : 
                              pattern.riskLevel === 'medium' ? 'bg-amber-50 border-amber-100' : 
                              'bg-emerald-50 border-emerald-100'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-lg ${
                                pattern.riskLevel === 'high' ? 'bg-rose-500 text-white' : 
                                pattern.riskLevel === 'medium' ? 'bg-amber-500 text-white' : 
                                'bg-emerald-500 text-white'
                              }`}>
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-slate-900 mb-1">{pattern.trend}</h3>
                                <p className="text-sm text-slate-600 mb-3 italic">"{pattern.insight}"</p>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                  <ChevronRight className="w-3 h-3" />
                                  Recommendation:
                                </div>
                                <p className="text-sm text-slate-800 font-medium mt-1">{pattern.recommendation}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Daily Progress */}
                  <section className="glass-panel p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-neuro-accent" />
                      Performance Tracking
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-100/50 p-4 rounded-xl border border-neuro-border">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Calories</p>
                        <p className="text-2xl font-mono font-bold text-slate-900">{stats.totals.calories}</p>
                      </div>
                      <div className="bg-slate-100/50 p-4 rounded-xl border border-neuro-border">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Meals Today</p>
                        <p className="text-2xl font-mono font-bold text-slate-900">{stats.count}</p>
                      </div>
                    </div>

                    <div className="h-[250px] w-full mb-8">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-4">Discipline Score Trend (Day 1 to Now)</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-[200px] w-full mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-4">Macro Distribution</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {macroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#0f172a' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {macroData.map((macro) => (
                        <div key={macro.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: macro.color }} />
                            <span className="text-slate-500">{macro.name}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700">{macro.value}g</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Right Column: Insights */}
            <div className="lg:col-span-5 space-y-8">
              {/* AI Nudge Center */}
              <section className="glass-panel p-6 bg-gradient-to-br from-white to-emerald-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-neuro-accent rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Neuro-Coach Feedback</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  {dailySummary ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{dailySummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">
                      Log your first meal to receive personalized behavioral feedback and neurological nudges.
                    </p>
                  )}
                </div>

                {dailySummary && (
                  <div className="mt-6 pt-6 border-t border-neuro-border">
                    <div className="flex items-center gap-2 text-neuro-accent text-sm font-semibold">
                      <Target className="w-4 h-4" />
                      Focus for next meal: High-fiber protein
                    </div>
                  </div>
                )}
              </section>

              {/* Discipline Tips */}
              <section className="glass-panel p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Discipline Principles</h2>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, text: "Wait 20 minutes for satiety signals to reach the brain.", color: "text-emerald-500" },
                    { icon: AlertCircle, text: "Avoid processed sugars to prevent dopamine spikes.", color: "text-amber-500" },
                    { icon: CheckCircle2, text: "Hydrate before meals to reduce impulsive eating.", color: "text-blue-500" }
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <tip.icon className={`w-4 h-4 shrink-0 mt-0.5 ${tip.color}`} />
                      <p className="text-xs text-slate-500 leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Corrective Tasks */}
              {pendingTasks.some(t => !t.isCompleted) && (
                <section className="glass-panel p-6 border-amber-500/20 bg-amber-50/10">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Discipline Recovery Tasks
                  </h2>
                  <div className="space-y-3">
                    {pendingTasks.filter(t => !t.isCompleted).map((task) => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/40 p-4 rounded-xl border border-white/20"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                            <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                                {task.type}
                              </span>
                              <span className="text-[10px] text-slate-400 italic">
                                Impact: {task.impact}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => completeTask(task.id)}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shrink-0"
                            title="Complete Task"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-neuro-border px-6 py-3 sm:hidden flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'log' ? 'text-neuro-accent' : 'text-slate-400'}`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'plan' ? 'text-neuro-accent' : 'text-slate-400'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Plan</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-neuro-accent' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-neuro-accent' : 'text-slate-400'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
