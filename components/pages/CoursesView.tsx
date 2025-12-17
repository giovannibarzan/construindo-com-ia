
import React, { useState, useEffect } from 'react';
import { CourseCategory, Course, CourseModule, CourseLesson, User } from '../../types';
import { backend } from '../../services/backend';
import CourseReviewModal from '../CourseReviewModal';

type CourseViewMode = 'ALL_CATEGORIES' | 'COURSES_LIST' | 'PLAYER';

interface CoursesViewProps {
    currentUser?: User | null;
}

const CoursesView: React.FC<CoursesViewProps> = ({ currentUser }) => {
    const [mode, setMode] = useState<CourseViewMode>('ALL_CATEGORIES');

    // Data State
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<CourseModule[]>([]);

    // Selection State
    const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);

    // Progress State
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [courseProgress, setCourseProgress] = useState({ completed: 0, total: 0, percentage: 0 });

    // Module expansion state
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        setLoading(true);
        backend.getCategories().then(data => {
            setCategories(data);
            setLoading(false);
        });
    }, []);

    // Load progress when course is selected
    useEffect(() => {
        if (selectedCourse && currentUser) {
            loadCourseProgress();
        }
    }, [selectedCourse, currentUser]);

    // Auto-expand first module
    useEffect(() => {
        if (modules.length > 0 && expandedModules.length === 0) {
            setExpandedModules([modules[0].id]);
        }
    }, [modules]);

    const loadCourseProgress = async () => {
        if (!selectedCourse || !currentUser) return;

        try {
            const progress = await backend.getCourseProgress(currentUser.id, selectedCourse.id);
            setCourseProgress(progress);

            const completed = await backend.getCompletedLessons(currentUser.id, selectedCourse.id);
            setCompletedLessons(completed);
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    // Calculate module progress
    const getModuleProgress = (module: CourseModule) => {
        const totalLessons = module.lessons.length;
        const completedInModule = module.lessons.filter(l => completedLessons.includes(l.id)).length;
        const percentage = totalLessons > 0 ? Math.round((completedInModule / totalLessons) * 100) : 0;
        return { completed: completedInModule, total: totalLessons, percentage };
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleMarkComplete = async (lessonId: string) => {
        if (!currentUser || !selectedCourse) return;

        try {
            await backend.markLessonComplete(currentUser.id, selectedCourse.id, lessonId);

            // Update local state
            setCompletedLessons(prev => [...prev, lessonId]);

            // Reload progress
            await loadCourseProgress();

            // Check if course is 100% complete
            const newProgress = await backend.getCourseProgress(currentUser.id, selectedCourse.id);
            if (newProgress.percentage === 100) {
                // Check if user already reviewed
                const existingReview = await backend.getUserCourseReview(currentUser.id, selectedCourse.id);
                if (!existingReview) {
                    setShowReviewModal(true);
                }
            }
        } catch (error) {
            console.error('Error marking lesson complete:', error);
        }
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!currentUser || !selectedCourse) return;
        await backend.submitCourseReview(currentUser.id, selectedCourse.id, rating, comment);
    };

    // --- HANDLERS ---

    const handleCategorySelect = async (cat: CourseCategory) => {
        setLoading(true);
        setSelectedCategory(cat);
        try {
            const courseData = await backend.getCoursesByCategory(cat.id);
            setCourses(courseData);
            setMode('COURSES_LIST');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = async (course: Course) => {
        setLoading(true);
        setSelectedCourse(course);
        try {
            const modulesData = await backend.getCourseModules(course.id);
            setModules(modulesData);

            // Auto-select first lesson if available
            if (modulesData.length > 0 && modulesData[0].lessons.length > 0) {
                const firstLesson = modulesData[0].lessons[0];
                setSelectedLesson(firstLesson);

                // Update URL
                const courseSlug = course.title.toLowerCase().replace(/\s+/g, '-');
                const lessonSlug = firstLesson.title.toLowerCase().replace(/\s+/g, '-');
                window.history.pushState({}, '', `/courses/${courseSlug}/${lessonSlug}`);
            }

            setMode('PLAYER');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCategories = () => {
        setMode('ALL_CATEGORIES');
        setSelectedCategory(null);
        window.history.pushState({}, '', '/courses');
    };

    const handleBackToCourses = () => {
        setMode('COURSES_LIST');
        setSelectedCourse(null);
        setModules([]);
        setSelectedLesson(null);
        setCompletedLessons([]);
        setCourseProgress({ completed: 0, total: 0, percentage: 0 });
        if (selectedCategory) {
            const catSlug = selectedCategory.title.toLowerCase().replace(/\s+/g, '-');
            window.history.pushState({}, '', `/courses/${catSlug}`);
        }
    };

    // Helper to get all lessons in order
    const getAllLessons = () => {
        const allLessons: CourseLesson[] = [];
        modules.forEach(module => {
            module.lessons.forEach(lesson => {
                allLessons.push(lesson);
            });
        });
        return allLessons;
    };

    // Navigation between lessons
    const handleNextLesson = () => {
        if (!selectedLesson) return;
        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            setSelectedLesson(nextLesson);
            updateLessonURL(nextLesson);
        }
    };

    const handlePreviousLesson = () => {
        if (!selectedLesson) return;
        const allLessons = getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            setSelectedLesson(prevLesson);
            updateLessonURL(prevLesson);
        }
    };

    const updateLessonURL = (lesson: CourseLesson) => {
        if (!selectedCourse) return;
        const courseSlug = selectedCourse.title.toLowerCase().replace(/\s+/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/\s+/g, '-');
        window.history.pushState({}, '', `/courses/${courseSlug}/${lessonSlug}`);
    };

    // --- RENDER: 1. ALL CATEGORIES (HERO STYLE) ---
    if (mode === 'ALL_CATEGORIES') {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                {/* Hero Banner */}
                <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 gradient-animate"></div>
                    <div className="absolute inset-0 mesh-background opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white mb-4 uppercase tracking-wider">
                                <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                                Academy Premium
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
                                Domine a Nova Era da IA
                            </h1>
                            <p className="text-gray-200 max-w-2xl text-lg md:text-xl mb-6">
                                Cursos práticos de <span className="font-bold text-primary-300">Lovable</span>, <span className="font-bold text-primary-300">Vibe Coding</span> e <span className="font-bold text-primary-300">Engenharia de Agentes</span>. Do zero ao deploy.
                            </p>

                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-200">
                                    <span className="material-symbols-outlined text-primary-400">school</span>
                                    <span><strong className="text-white">{categories.length}</strong> Trilhas</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-200">
                                    <span className="material-symbols-outlined text-green-400">play_circle</span>
                                    <span><strong className="text-white">50+</strong> Aulas</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-200">
                                    <span className="material-symbols-outlined text-amber-400">emoji_events</span>
                                    <span><strong className="text-white">Certificados</strong> Inclusos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid of Categories */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary-500 text-3xl">category</span>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trilhas de Conhecimento</h2>
                        </div>

                        {!loading && categories.length > 0 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {categories.length} trilhas disponíveis
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-3xl skeleton"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat)}
                                    className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left"
                                >
                                    {/* Logo Section */}
                                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                                        <img
                                            src={cat.thumbnailUrl}
                                            alt={cat.title}
                                            className="w-24 h-24 object-contain"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6">
                                        {/* Tags */}
                                        {cat.isPremium && (
                                            <span className="inline-block px-3 py-1 bg-gradient-premium text-white text-xs font-bold uppercase rounded-full mb-3">
                                                Premium
                                            </span>
                                        )}

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                            {cat.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {cat.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER: 2. COURSES LIST ---
    if (mode === 'COURSES_LIST' && selectedCategory) {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={handleBackToCategories} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary w-fit font-bold">
                    <span className="material-symbols-outlined">arrow_back</span> Voltar para Trilhas
                </button>

                <div className="flex items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Trilha Selecionada</span>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mt-1">{selectedCategory.title}</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">Nenhum curso disponível nesta trilha ainda.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => handleCourseSelect(course)}
                                className="group flex flex-col md:flex-row bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg"
                            >
                                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200 relative overflow-hidden shrink-0">
                                    <img src={course.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={course.title} />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col justify-center flex-1">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                        {course.level && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{course.level}</span>}
                                        {course.duration && <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-sm">schedule</span> {course.duration}</span>}
                                        {course.modulesCount !== undefined && <span className="flex items-center gap-1"><span className="material-symbols-outlined !text-sm">view_module</span> {course.modulesCount} Módulos</span>}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>

                                    <div className="flex items-center gap-2 mt-auto">
                                        <div className="size-6 rounded-full bg-gray-200 overflow-hidden">
                                            <img src={`https://ui-avatars.com/api/?name=${course.authorName || 'Admin'}&background=random`} alt="Author" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.authorName || 'Instrutor Construindo com IA'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER: 3. PLAYER WITH PROGRESS ---
    if (mode === 'PLAYER' && selectedCourse && selectedLesson) {
        const isLessonCompleted = completedLessons.includes(selectedLesson.id);

        return (
            <div className="flex flex-col h-[calc(100vh-100px)] animate-in zoom-in-95 duration-300">
                {/* Header with Progress */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBackToCourses} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs text-gray-500 font-bold uppercase">{selectedCourse.title}</span>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedLesson.title}</h2>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {currentUser && (
                        <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Progresso do Curso</span>
                                <span className="text-sm font-bold text-primary">{courseProgress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${courseProgress.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {courseProgress.completed} de {courseProgress.total} aulas concluídas
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* MAIN CONTENT */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                        {/* Video Player - Larger */}
                        <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
                            <iframe
                                className="w-full h-full"
                                src={selectedLesson.videoUrl ? selectedLesson.videoUrl.replace('watch?v=', 'embed/') : ''}
                                title="Video Player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            {!selectedLesson.videoUrl && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-6xl opacity-50">videocam_off</span>
                                        <p className="mt-2">Vídeo indisponível</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handlePreviousLesson}
                                disabled={getAllLessons().findIndex(l => l.id === selectedLesson.id) === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Aula Anterior
                            </button>
                            <button
                                onClick={handleNextLesson}
                                disabled={getAllLessons().findIndex(l => l.id === selectedLesson.id) === getAllLessons().length - 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima Aula
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h1>
                                {currentUser && (
                                    <button
                                        onClick={() => handleMarkComplete(selectedLesson.id)}
                                        disabled={isLessonCompleted}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isLessonCompleted
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-not-allowed'
                                            : 'bg-primary hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined !text-lg">
                                            {isLessonCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        {isLessonCompleted ? 'Concluída' : 'Marcar como Concluída'}
                                    </button>
                                )}
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300">
                                {selectedLesson.content}
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="w-full lg:w-96 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col overflow-hidden h-fit max-h-full">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="font-bold text-gray-900 dark:text-white">Conteúdo do Curso</h3>
                            <p className="text-xs text-gray-500 mt-1">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas • {modules.length} módulos</p>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {modules.map((module, idx) => {
                                const moduleProgress = getModuleProgress(module);
                                const isExpanded = expandedModules.includes(module.id);

                                return (
                                    <div key={module.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        {/* Module Header - Clickable */}
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="material-symbols-outlined text-sm text-gray-500">
                                                        {isExpanded ? 'expand_more' : 'chevron_right'}
                                                    </span>
                                                    <span className="font-bold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                        Módulo {idx + 1}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-primary">{moduleProgress.percentage}%</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 pl-6">{module.title}</p>

                                            {/* Module Progress Bar */}
                                            <div className="pl-6">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-primary to-blue-600 h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${moduleProgress.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {moduleProgress.completed} de {moduleProgress.total} aulas
                                                </p>
                                            </div>
                                        </button>

                                        {/* Lessons - Collapsible */}
                                        {isExpanded && (
                                            <div className="flex flex-col">
                                                {module.lessons.map((lesson, lIdx) => {
                                                    const isActive = lesson.id === selectedLesson.id;
                                                    const isCompleted = completedLessons.includes(lesson.id);
                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => {
                                                                setSelectedLesson(lesson);
                                                                updateLessonURL(lesson);
                                                            }}
                                                            className={`flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${isActive ? 'bg-primary/5 border-primary' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                                        >
                                                            <div className={`size-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                                {isCompleted ? <span className="material-symbols-outlined !text-sm">check</span> : lIdx + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{lesson.title}</p>
                                                                <p className="text-xs text-gray-400">{lesson.duration}</p>
                                                            </div>
                                                            {isCompleted && <span className="material-symbols-outlined text-green-500 !text-sm fill">check_circle</span>}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Review Modal */}
                {currentUser && selectedCourse && (
                    <CourseReviewModal
                        isOpen={showReviewModal}
                        onClose={() => setShowReviewModal(false)}
                        courseId={selectedCourse.id}
                        courseTitle={selectedCourse.title}
                        onSubmit={handleSubmitReview}
                    />
                )}
            </div>
        );
    }

    return <div className="text-center p-10">Carregando...</div>;
};

export default CoursesView;
