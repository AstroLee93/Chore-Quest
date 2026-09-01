import React, { useState, useEffect } from 'react';
import {
  X,
  ChefHat,
  Clock,
  Users,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Printer,
  BookOpen,
  Info,
  Apple,
  Search,
} from 'lucide-react';
import { MealRecipe, DailyDinnerPlan } from '../types';
import { getRecipeForDish, searchRecipeForDish } from '../utils/menu';
import { sound } from '../utils/sound';

interface MealRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DailyDinnerPlan;
  dayLabel: string;
  onSaveRecipe: (updatedRecipe: MealRecipe) => void;
  isParentMode?: boolean;
}

export const MealRecipeModal: React.FC<MealRecipeModalProps> = ({
  isOpen,
  onClose,
  plan,
  dayLabel,
  onSaveRecipe,
  isParentMode = false,
}) => {
  const isUnplanned =
    !plan.mainDish ||
    plan.mainDish.trim() === '' ||
    plan.mainDish.toLowerCase().includes('unplanned') ||
    plan.mainDish.toLowerCase().includes('open night');

  // Ensure we have a valid recipe object, fallback to intelligent recipe generator
  const activeRecipe: MealRecipe =
    plan.recipe || (!isUnplanned ? getRecipeForDish(plan.mainDish, plan.theme) : {
      prepTime: '5 mins',
      cookTime: '0 mins',
      servings: '2-4 servings',
      difficulty: 'Quick',
      ingredients: [],
      instructions: [],
    });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<MealRecipe>(activeRecipe);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [searchDishInput, setSearchDishInput] = useState<string>('');

  // Input states for adding new ingredient/step in edit mode
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [newStep, setNewStep] = useState<string>('');
  const [newSub, setNewSub] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const current =
        plan.recipe || (!isUnplanned ? getRecipeForDish(plan.mainDish, plan.theme) : {
          prepTime: '5 mins',
          cookTime: '0 mins',
          servings: '2-4 servings',
          difficulty: 'Quick',
          ingredients: [],
          instructions: [],
        });
      setEditForm(JSON.parse(JSON.stringify(current)));
      setCheckedIngredients({});
      setCompletedSteps({});
      setIsEditing(false);
      setSearchDishInput('');
    }
  }, [isOpen, plan, isUnplanned]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, onClose]);

  if (!isOpen) return null;

  const toggleIngredient = (index: number) => {
    sound.playTap();
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleStep = (index: number) => {
    sound.playTap();
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSave = () => {
    sound.playStarEarned();
    onSaveRecipe(editForm);
    setIsEditing(false);
  };

  const handleResetToStandard = () => {
    sound.playStarEarned();
    const standard = getRecipeForDish(plan.mainDish, plan.theme);
    setEditForm(JSON.parse(JSON.stringify(standard)));
    onSaveRecipe(standard);
    setCheckedIngredients({});
    setCompletedSteps({});
    setIsEditing(false);
  };

  const handleQuickImport = (dishTitle: string) => {
    if (!dishTitle.trim()) return;
    sound.playStarEarned();
    const res = searchRecipeForDish(dishTitle, plan.theme);
    onSaveRecipe(res.recipe);
    setEditForm(JSON.parse(JSON.stringify(res.recipe)));
    setCheckedIngredients({});
    setCompletedSteps({});
    setIsEditing(false);
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    sound.playTap();
    setEditForm({
      ...editForm,
      ingredients: [...(editForm.ingredients || []), newIngredient.trim()],
    });
    setNewIngredient('');
  };

  const handleRemoveIngredient = (idx: number) => {
    sound.playTap();
    setEditForm({
      ...editForm,
      ingredients: (editForm.ingredients || []).filter((_, i) => i !== idx),
    });
  };

  const handleAddStep = () => {
    if (!newStep.trim()) return;
    sound.playTap();
    setEditForm({
      ...editForm,
      instructions: [...(editForm.instructions || []), newStep.trim()],
    });
    setNewStep('');
  };

  const handleRemoveStep = (idx: number) => {
    sound.playTap();
    setEditForm({
      ...editForm,
      instructions: (editForm.instructions || []).filter((_, i) => i !== idx),
    });
  };

  const handleAddSubstitution = () => {
    if (!newSub.trim()) return;
    sound.playTap();
    setEditForm({
      ...editForm,
      substitutions: [...(editForm.substitutions || []), newSub.trim()],
    });
    setNewSub('');
  };

  const handleRemoveSubstitution = (idx: number) => {
    sound.playTap();
    setEditForm({
      ...editForm,
      substitutions: (editForm.substitutions || []).filter((_, i) => i !== idx),
    });
  };

  const currentData = isEditing ? editForm : plan.recipe || activeRecipe;
  const hasNoRecipe = isUnplanned && !plan.recipe && (!currentData.ingredients || currentData.ingredients.length === 0);

  return (
    <div
      id="recipe-modal-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="recipe-modal-container"
        className="bg-white border-4 border-amber-400 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-yellow-400 border-2 border-yellow-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {plan.icon || '📖'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-yellow-300 font-black text-[11px] uppercase tracking-wider">
                  {dayLabel}'s Family Recipe
                </span>
                {plan.theme && (
                  <span className="text-xs font-black text-amber-950">
                    {plan.theme}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                <span>{plan.mainDish || 'Unplanned / Open Night'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasNoRecipe && (
              <>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-refresh-recipe"
                      onClick={handleResetToStandard}
                      className="px-3 py-2 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Update and verify recipe matches dish title"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Verify Standard Recipe</span>
                    </button>
                    <button
                      id="btn-edit-recipe"
                      onClick={() => {
                        sound.playTap();
                        setEditForm(JSON.parse(JSON.stringify(currentData)));
                        setIsEditing(true);
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-yellow-50 text-slate-950 border-2 border-amber-600/40 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      title="Edit ingredients or steps"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">Edit Recipe</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playTap();
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-save-recipe-changes"
                      onClick={handleSave}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save Recipe</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    sound.playTap();
                    window.print();
                  }}
                  className="w-10 h-10 rounded-2xl bg-white hover:bg-yellow-50 text-slate-900 border-2 border-amber-600/40 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                  title="Print Recipe Card"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                </button>
              </>
            )}

            <button
              id="btn-close-recipe-modal"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-10 h-10 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
              title="Close Recipe (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recipe Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-amber-50/40 space-y-6">
          {hasNoRecipe ? (
            /* Empty State for Unplanned / Deleted Day */
            <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
                🍽️
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  No Recipe Planned for {dayLabel}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  This day is currently set to Open Night or was cleared. Type any dish name below (e.g. <span className="font-bold text-amber-900">Peanut Butter and Jelly</span>, <span className="font-bold text-amber-900">Grilled Cheese</span>, <span className="font-bold text-amber-900">Tacos</span>) or tap a family favorite to immediately generate verified ingredients and step-by-step instructions!
                </p>
              </div>

              {/* Search & Import Box */}
              <div className="max-w-lg mx-auto flex items-center gap-2 bg-amber-50 p-2 rounded-2xl border-2 border-amber-300 shadow-xs">
                <Search className="w-4 h-4 text-amber-600 ml-2 shrink-0" />
                <input
                  type="text"
                  value={searchDishInput}
                  onChange={(e) => setSearchDishInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickImport(searchDishInput)}
                  placeholder="Enter dish name (e.g. Peanut Butter and Jelly)..."
                  className="flex-1 bg-transparent border-0 text-xs sm:text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleQuickImport(searchDishInput)}
                  disabled={!searchDishInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Recipe</span>
                </button>
              </div>

              {/* Quick Family Favorite Chips */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Quick Family Presets
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { label: '🥪 Peanut Butter & Jelly', dish: 'Peanut Butter and Jelly' },
                    { label: '🧀 Grilled Cheese & Soup', dish: 'Grilled Cheese' },
                    { label: '🌮 Build-Your-Own Tacos', dish: 'Tacos' },
                    { label: '🍕 Pepperoni Pizza', dish: 'Pepperoni Pizza' },
                    { label: '🥞 Buttermilk Pancakes', dish: 'Pancakes' },
                    { label: '🍝 Spaghetti & Meatballs', dish: 'Spaghetti' },
                    { label: '🍗 Chicken Tenders', dish: 'Chicken Tenders' },
                    { label: '🌭 Hot Dogs & Fries', dish: 'Hot Dogs' },
                    { label: '🧀 Crispy Quesadillas', dish: 'Quesadillas' },
                  ].map((chip) => (
                    <button
                      key={chip.dish}
                      onClick={() => handleQuickImport(chip.dish)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-transform active:scale-95 cursor-pointer border border-amber-300/60"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Prep Time
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.prepTime || ''}
                        onChange={(e) => setEditForm({ ...editForm, prepTime: e.target.value })}
                        className="w-full text-xs font-black border border-amber-300 rounded px-1.5 py-0.5"
                        placeholder="e.g. 5 mins"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {currentData.prepTime || '5 mins'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-800 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Cook Time
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.cookTime || ''}
                        onChange={(e) => setEditForm({ ...editForm, cookTime: e.target.value })}
                        className="w-full text-xs font-black border border-amber-300 rounded px-1.5 py-0.5"
                        placeholder="e.g. 0 mins"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {currentData.cookTime || '0 mins'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Servings
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.servings || ''}
                        onChange={(e) => setEditForm({ ...editForm, servings: e.target.value })}
                        className="w-full text-xs font-black border border-amber-300 rounded px-1.5 py-0.5"
                        placeholder="e.g. 2-4 servings"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {currentData.servings || '2-4 servings'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Difficulty
                    </span>
                    {isEditing ? (
                      <select
                        value={editForm.difficulty || 'Easy'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            difficulty: e.target.value as 'Easy' | 'Medium' | 'Quick',
                          })
                        }
                        className="w-full text-xs font-black border border-amber-300 rounded px-1.5 py-0.5 bg-white"
                      >
                        <option value="Quick">Quick (⚡ 0-10m)</option>
                        <option value="Easy">Easy (🍳 Simple)</option>
                        <option value="Medium">Medium (👩‍🍳 Detailed)</option>
                      </select>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {currentData.difficulty || 'Quick'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Ingredients & Step-by-Step Directions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Ingredients Checklist (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                        {(currentData.ingredients || []).length}
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                        Ingredients Checklist
                      </h3>
                    </div>
                    {!isEditing && (
                      <span className="text-[11px] font-bold text-amber-700">
                        Tap to check off
                      </span>
                    )}
                  </div>

                  {/* Ingredients List */}
                  <div className="space-y-2">
                    {!isEditing ? (
                      (currentData.ingredients || []).map((ing, idx) => {
                        const isChecked = !!checkedIngredients[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleIngredient(idx)}
                            className={`flex items-start gap-3 p-2.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                              isChecked
                                ? 'bg-emerald-50/70 border-emerald-300 text-slate-400 line-through'
                                : 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-200/80 text-slate-800'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-bold leading-snug">
                              {ing}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-2">
                        {(editForm.ingredients || []).map((ing, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200"
                          >
                            <input
                              type="text"
                              value={ing}
                              onChange={(e) => {
                                const updated = [...(editForm.ingredients || [])];
                                updated[idx] = e.target.value;
                                setEditForm({ ...editForm, ingredients: updated });
                              }}
                              className="flex-1 text-xs font-bold border-0 focus:ring-0 p-1"
                            />
                            <button
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Remove ingredient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Add Ingredient Row */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newIngredient}
                            onChange={(e) => setNewIngredient(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                            placeholder="e.g. 2 tbsp Peanut Butter..."
                            className="flex-1 px-3 py-2 text-xs font-bold border-2 border-dashed border-amber-300 rounded-xl bg-white"
                          />
                          <button
                            onClick={handleAddIngredient}
                            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Step-by-Step Directions (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-amber-600" />
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                        Step-by-Step Cooking Directions
                      </h3>
                    </div>
                    {!isEditing && (
                      <span className="text-[11px] font-bold text-amber-700">
                        {Object.values(completedSteps).filter(Boolean).length} of{' '}
                        {(currentData.instructions || []).length} done
                      </span>
                    )}
                  </div>

                  {/* Steps List */}
                  <div className="space-y-3">
                    {!isEditing ? (
                      (currentData.instructions || []).map((step, idx) => {
                        const isDone = !!completedSteps[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleStep(idx)}
                            className={`flex items-start gap-3.5 p-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-300 opacity-70'
                                : 'bg-amber-50/30 hover:bg-amber-100/50 border-amber-200/70'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 text-slate-950'
                              }`}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                                  isDone
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-800'
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-2.5">
                        {(editForm.instructions || []).map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-2xl border border-amber-200"
                          >
                            <span className="w-5 h-5 rounded-lg bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-1">
                              {idx + 1}
                            </span>
                            <textarea
                              rows={2}
                              value={step}
                              onChange={(e) => {
                                const updated = [...(editForm.instructions || [])];
                                updated[idx] = e.target.value;
                                setEditForm({ ...editForm, instructions: updated });
                              }}
                              className="flex-1 text-xs font-medium border-0 focus:ring-0 p-1 bg-white rounded-lg resize-none"
                            />
                            <button
                              onClick={() => handleRemoveStep(idx)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer mt-1"
                              title="Remove step"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Add Step Row */}
                        <div className="flex items-start gap-2 pt-1">
                          <textarea
                            rows={2}
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            placeholder="Type next cooking instruction step..."
                            className="flex-1 px-3 py-2 text-xs font-medium border-2 border-dashed border-amber-300 rounded-2xl bg-white resize-none"
                          />
                          <button
                            onClick={handleAddStep}
                            className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0 mt-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Step</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Substitutions & Family Dietary Notes Box */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-yellow-200">
                  <h3 className="text-xs sm:text-sm font-black text-yellow-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Dietary Substitutions & Chef's Notes</span>
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleResetToStandard}
                      className="px-2.5 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore Standard Recipe</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-2">
                    {(currentData.substitutions || []).map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-bold text-amber-950">
                        <span className="text-amber-600 shrink-0">💡</span>
                        <span>{sub}</span>
                      </div>
                    ))}

                    {currentData.notes && (
                      <div className="mt-2 pt-2 border-t border-yellow-200/80 text-xs font-semibold text-slate-700 italic">
                        📌 {currentData.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(editForm.substitutions || []).map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2 rounded-xl border border-yellow-200"
                      >
                        <input
                          type="text"
                          value={sub}
                          onChange={(e) => {
                            const updated = [...(editForm.substitutions || [])];
                            updated[idx] = e.target.value;
                            setEditForm({ ...editForm, substitutions: updated });
                          }}
                          className="flex-1 text-xs font-bold border-0 focus:ring-0 p-1"
                        />
                        <button
                          onClick={() => handleRemoveSubstitution(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Remove substitution"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newSub}
                        onChange={(e) => setNewSub(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubstitution()}
                        placeholder="e.g. Nut-Free: Use sunflower seed butter (SunButter)..."
                        className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-dashed border-amber-300 rounded-xl bg-white"
                      />
                      <button
                        onClick={handleAddSubstitution}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Swap</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                        Family Chef's Special Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="e.g. Spread peanut butter on both slices before jelly to prevent sogginess..."
                        className="w-full px-3 py-2 text-xs font-medium border-2 border-slate-200 rounded-xl bg-white resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-amber-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Family Kitchen Recipe Companion</span>
          </div>

          <div className="flex items-center gap-2">
            {!hasNoRecipe && isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save All Recipe Changes</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="px-5 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black cursor-pointer shadow-md active:scale-95"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
