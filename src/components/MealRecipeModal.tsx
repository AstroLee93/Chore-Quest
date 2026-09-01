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
} from 'lucide-react';
import { MealRecipe, DailyDinnerPlan } from '../types';
import { getRecipeForDish } from '../utils/menu';
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
  // Ensure we have a valid recipe object, fallback to intelligent recipe generator
  const activeRecipe: MealRecipe = plan.recipe || getRecipeForDish(plan.mainDish, plan.theme);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<MealRecipe>(activeRecipe);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Input states for adding new ingredient/step in edit mode
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [newStep, setNewStep] = useState<string>('');
  const [newSub, setNewSub] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const current = plan.recipe || getRecipeForDish(plan.mainDish, plan.theme);
      setEditForm(JSON.parse(JSON.stringify(current)));
      setCheckedIngredients({});
      setCompletedSteps({});
      setIsEditing(false);
    }
  }, [isOpen, plan]);

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
    sound.playTap();
    const standard = getRecipeForDish(plan.mainDish, plan.theme);
    setEditForm(JSON.parse(JSON.stringify(standard)));
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
                <span>{plan.mainDish}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
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
                    placeholder="e.g. 15 mins"
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {currentData.prepTime || '15 mins'}
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
                    placeholder="e.g. 20 mins"
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {currentData.cookTime || '20 mins'}
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
                    placeholder="e.g. 4-6 servings"
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {currentData.servings || '4-6 servings'}
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
                    <option value="Easy">Easy</option>
                    <option value="Quick">Quick</option>
                    <option value="Medium">Medium</option>
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                    {currentData.difficulty || 'Easy'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Side Dishes & Dessert Callout */}
          {(plan.sideDishes || plan.dessert) && (
            <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-extrabold text-amber-950">
              {plan.sideDishes && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🥗</span>
                  <span><strong>Sides:</strong> {plan.sideDishes}</span>
                </div>
              )}
              {plan.dessert && (
                <div className="flex items-center gap-1.5 text-pink-900">
                  <span className="text-base">🍨</span>
                  <span><strong>Dessert:</strong> {plan.dessert}</span>
                </div>
              )}
            </div>
          )}

          {/* Main 2-Column Content: Ingredients on Left, Steps on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Ingredients Column (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-300">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span>Ingredients Checklist</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentData.ingredients?.length || 0} items
                </span>
              </div>

              {!isEditing ? (
                <div className="space-y-2">
                  {(currentData.ingredients || []).map((item, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredient(idx)}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer select-none ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through opacity-75'
                            : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold leading-snug">{item}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Edit Ingredients List */
                <div className="space-y-2">
                  {(editForm.ingredients || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs"
                    >
                      <input
                        type="text"
                        value={item}
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
                        <Trash2 className="w-3.5 h-3.5" />
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
                      placeholder="e.g. 1 tbsp Olive Oil..."
                      className="flex-1 px-3 py-2 text-xs font-bold border-2 border-dashed border-amber-300 rounded-xl bg-white"
                    />
                    <button
                      onClick={handleAddIngredient}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Instructions Column (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-300">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Step-by-Step Directions</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentData.instructions?.length || 0} steps
                </span>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  {(currentData.instructions || []).map((step, idx) => {
                    const isDone = !!completedSteps[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 opacity-80'
                            : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 shadow-xs'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDone ? 'line-through text-emerald-900' : 'text-slate-800'}`}>
                            {step}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Edit Instructions Steps */
                <div className="space-y-2.5">
                  {(editForm.instructions || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 mt-1">
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
                        className="flex-1 text-xs font-medium border-0 focus:ring-0 p-1 resize-none"
                      />
                      <button
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer mt-1"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    placeholder="e.g. Gluten-Free: Use GF tamari sauce instead of soy..."
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
                    placeholder="e.g. Maya likes dipping hers in honey mustard; Leo prepares the salad..."
                    className="w-full px-3 py-2 text-xs font-medium border-2 border-slate-200 rounded-xl bg-white resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-amber-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Family Kitchen Recipe Companion</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
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
