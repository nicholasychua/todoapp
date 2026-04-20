"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mountain,
  GripVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Rock,
  type RockPeriod,
  addWeeks,
  addQuarters,
  addYears,
  formatWeekLabel,
  formatWeekRangeShort,
  formatQuarterLabel,
  formatQuarterRange,
  formatYearLabel,
  getCurrentWeekKey,
  getCurrentQuarterKey,
  getCurrentYearKey,
  getQuarterForWeek,
  getWeeksInQuarter,
} from "@/lib/rocks";

export interface RocksProps {
  isOpen: boolean;
  weeklyRocks: Rock[];
  quarterlyRocks: Rock[];
  yearlyRocks: Rock[];
  selectedWeekKey: string;
  selectedQuarterKey: string;
  selectedYearKey: string;
  onSelectWeekKey: (key: string) => void;
  onSelectQuarterKey: (key: string) => void;
  onSelectYearKey: (key: string) => void;
  onAddRock: (text: string, period: RockPeriod) => void;
  onToggleRock: (id: string, completed: boolean) => void;
  onDeleteRock: (id: string) => void;
  onReorderRocks: (rocks: Rock[], period: RockPeriod) => void;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function RockCheckbox({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div
      className={cn(
        "h-4 w-4 min-h-4 min-w-4 rounded border border-gray-300 flex items-center justify-center transition-colors cursor-pointer",
        checked ? "border-gray-400 bg-gray-100" : "bg-white"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange();
      }}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-gray-600"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

interface PeriodNavProps {
  title: string;
  rangeLabel: string;
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onTitleClick?: () => void;
  titleExpanded?: boolean;
  countPill?: string;
}

function PeriodNav({
  title,
  rangeLabel,
  isCurrent,
  onPrev,
  onNext,
  onToday,
  onTitleClick,
  titleExpanded,
  countPill,
}: PeriodNavProps) {
  const labelContent = (
    <>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <span className="text-xs text-gray-400 truncate">{rangeLabel}</span>
      {countPill && (
        <span className="text-[10px] font-medium text-gray-400 tabular-nums bg-gray-100 rounded-full px-1.5 py-0.5">
          {countPill}
        </span>
      )}
      {onTitleClick && (
        <ChevronDown
          className={cn(
            "h-3 w-3 text-gray-400 transition-transform duration-200",
            titleExpanded ? "rotate-0" : "-rotate-90"
          )}
        />
      )}
    </>
  );

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      {onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          aria-expanded={!!titleExpanded}
          className="flex items-center gap-2 min-w-0 rounded-md px-1 -mx-1 py-0.5 hover:bg-gray-50 transition-colors"
        >
          {labelContent}
        </button>
      ) : (
        <div className="flex items-center gap-2 min-w-0">{labelContent}</div>
      )}
      <div className="flex items-center gap-0.5">
        {!isCurrent && (
          <button
            onClick={onToday}
            className="text-[11px] font-medium text-gray-500 hover:text-gray-900 px-2 py-0.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Jump to current"
          >
            Today
          </button>
        )}
        <button
          onClick={onPrev}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onNext}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rock list (shared by all sections)                                        */
/* -------------------------------------------------------------------------- */

interface RockListProps {
  rocks: Rock[];
  placeholder: string;
  onAddRock: (text: string) => void;
  onToggleRock: (id: string, completed: boolean) => void;
  onDeleteRock: (id: string) => void;
  onReorder: (rocks: Rock[]) => void;
}

function RockList({
  rocks,
  placeholder,
  onAddRock,
  onToggleRock,
  onDeleteRock,
  onReorder,
}: RockListProps) {
  const [newRockText, setNewRockText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddRock = () => {
    const text = newRockText.trim();
    if (!text) return;
    onAddRock(text);
    setNewRockText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRock();
    }
  };

  const handleReorder = useCallback(
    (newOrder: Rock[]) => {
      onReorder(newOrder);
    },
    [onReorder]
  );

  return (
    <div className="space-y-2">
      {rocks.length > 0 && (
        <Reorder.Group
          axis="y"
          values={rocks}
          onReorder={handleReorder}
          className="space-y-1"
        >
          <AnimatePresence initial={false}>
            {rocks.map((rock) => (
              <Reorder.Item
                key={rock.id}
                value={rock}
                layout="position"
                initial={{ opacity: 0, y: 6, scale: 0.9, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  height: "auto",
                  transition: {
                    height: {
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    opacity: {
                      duration: 0.3,
                      delay: 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    y: {
                      duration: 0.38,
                      delay: 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                      mass: 0.9,
                      delay: 0.05,
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  x: -16,
                  scale: 0.96,
                  height: 0,
                  transition: {
                    duration: 0.22,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                className="flex items-center gap-2.5 group rounded-lg px-2 py-1.5 -mx-2 hover:bg-gray-50 transition-colors origin-left will-change-transform"
              >
                <GripVertical className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0" />
                <RockCheckbox
                  checked={rock.completed}
                  onCheckedChange={() => onToggleRock(rock.id, !rock.completed)}
                />
                <span
                  className={cn(
                    "text-sm flex-1 transition-all duration-200",
                    rock.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-700"
                  )}
                >
                  {rock.text}
                </span>
                <button
                  onClick={() => onDeleteRock(rock.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 p-0.5 flex-shrink-0"
                  aria-label="Delete rock"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-gray-300 transition-colors">
          <Plus className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newRockText}
            onChange={(e) => setNewRockText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Week picker (list of weeks in the quarter owning the selected week)       */
/* -------------------------------------------------------------------------- */

interface WeekPickerProps {
  open: boolean;
  quarterKey: string;
  selectedWeekKey: string;
  onSelectWeek: (weekKey: string) => void;
}

function WeekPicker({
  open,
  quarterKey,
  selectedWeekKey,
  onSelectWeek,
}: WeekPickerProps) {
  const weeks = useMemo(() => getWeeksInQuarter(quarterKey), [quarterKey]);
  const currentWeekKey = getCurrentWeekKey();

  return (
    <AnimatePresence initial={false}>
      {open && weeks.length > 0 && (
        <motion.ul
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden space-y-0.5 border border-gray-100 rounded-lg bg-gray-50/50 p-1"
        >
          {weeks.map((wk) => {
            const isSelected = wk === selectedWeekKey;
            const isCurrent = wk === currentWeekKey;
            const weekNum = parseInt(wk.split("-W")[1], 10);
            return (
              <li key={wk}>
                <button
                  onClick={() => onSelectWeek(wk)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors text-left",
                    isSelected
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-white/70 hover:text-gray-700"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">
                      W{String(weekNum).padStart(2, "0")}
                    </span>
                    <span className="text-gray-400">
                      {formatWeekRangeShort(wk)}
                    </span>
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      Now
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Collapsible body + persisted boolean hook                                 */
/* -------------------------------------------------------------------------- */

function usePersistedBool(
  key: string,
  defaultValue: boolean
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = useState<boolean>(defaultValue);

  // Hydrate from localStorage once on mount to avoid SSR hydration mismatches.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === "true" || raw === "false") {
        setValue(raw === "true");
      }
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }, [key]);

  const update = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: boolean) => boolean)(prev)
            : next;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, resolved ? "true" : "false");
          }
        } catch {
          // Ignore storage errors
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update];
}

function CollapsibleBody({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] },
            opacity: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
          }}
          className="overflow-hidden"
        >
          <div className="pt-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main panel                                                                */
/* -------------------------------------------------------------------------- */

export function Rocks({
  isOpen,
  weeklyRocks,
  quarterlyRocks,
  yearlyRocks,
  selectedWeekKey,
  selectedQuarterKey,
  selectedYearKey,
  onSelectWeekKey,
  onSelectQuarterKey,
  onSelectYearKey,
  onAddRock,
  onToggleRock,
  onDeleteRock,
  onReorderRocks,
  onClose,
}: RocksProps) {
  const totalRocks =
    weeklyRocks.length + quarterlyRocks.length + yearlyRocks.length;
  const completedRocks = [
    ...weeklyRocks,
    ...quarterlyRocks,
    ...yearlyRocks,
  ].filter((r) => r.completed).length;
  const progress = totalRocks > 0 ? completedRocks / totalRocks : 0;

  const currentWeekKey = getCurrentWeekKey();
  const currentQuarterKey = getCurrentQuarterKey();
  const currentYearKey = getCurrentYearKey();

  const weekIsCurrent = selectedWeekKey === currentWeekKey;
  const quarterIsCurrent = selectedQuarterKey === currentQuarterKey;
  const yearIsCurrent = selectedYearKey === currentYearKey;

  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [quarterCollapsed, setQuarterCollapsed] = usePersistedBool(
    "rocks.quarterCollapsed",
    false
  );
  const [yearCollapsed, setYearCollapsed] = usePersistedBool(
    "rocks.yearCollapsed",
    false
  );

  // When navigating weeks, keep the quarter in sync so the "Q" section reflects
  // the quarter that owns the week you're viewing. Users can still navigate
  // the quarter independently afterward.
  const handleSelectWeek = useCallback(
    (weekKey: string) => {
      onSelectWeekKey(weekKey);
      const owningQuarter = getQuarterForWeek(weekKey);
      if (owningQuarter !== selectedQuarterKey) {
        onSelectQuarterKey(owningQuarter);
      }
    },
    [onSelectWeekKey, onSelectQuarterKey, selectedQuarterKey]
  );

  const handlePickWeekFromList = useCallback(
    (weekKey: string) => {
      handleSelectWeek(weekKey);
      setWeekPickerOpen(false);
    },
    [handleSelectWeek]
  );

  // Always anchor the week-picker list to the quarter that contains the
  // currently selected week, even if the user navigated the quarter section
  // independently.
  const pickerQuarterKey = useMemo(
    () => getQuarterForWeek(selectedWeekKey),
    [selectedWeekKey]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div className="border border-gray-200 rounded-xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2.5">
                <Mountain className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  Rocks
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {completedRocks}/{totalRocks}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gray-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                  aria-label="Close rocks panel"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <div className="space-y-6 py-2">
                {/* This Week */}
                <div className="space-y-2">
                  <PeriodNav
                    title={weekIsCurrent ? "This Week" : "Week"}
                    rangeLabel={formatWeekLabel(selectedWeekKey)}
                    isCurrent={weekIsCurrent}
                    onPrev={() =>
                      handleSelectWeek(addWeeks(selectedWeekKey, -1))
                    }
                    onNext={() =>
                      handleSelectWeek(addWeeks(selectedWeekKey, 1))
                    }
                    onToday={() => handleSelectWeek(currentWeekKey)}
                    onTitleClick={() => setWeekPickerOpen((v) => !v)}
                    titleExpanded={weekPickerOpen}
                  />
                  <WeekPicker
                    open={weekPickerOpen}
                    quarterKey={pickerQuarterKey}
                    selectedWeekKey={selectedWeekKey}
                    onSelectWeek={handlePickWeekFromList}
                  />
                  <RockList
                    rocks={weeklyRocks}
                    placeholder={
                      weekIsCurrent
                        ? "Add a weekly goal..."
                        : "Add a goal to this week..."
                    }
                    onAddRock={(text) => onAddRock(text, "week")}
                    onToggleRock={onToggleRock}
                    onDeleteRock={onDeleteRock}
                    onReorder={(rocks) => onReorderRocks(rocks, "week")}
                  />
                </div>

                {/* This Quarter */}
                <div className="space-y-2">
                  <PeriodNav
                    title={quarterIsCurrent ? "This Quarter" : "Quarter"}
                    rangeLabel={
                      quarterCollapsed
                        ? formatQuarterLabel(selectedQuarterKey)
                        : `${formatQuarterLabel(selectedQuarterKey)} · ${formatQuarterRange(selectedQuarterKey)}`
                    }
                    isCurrent={quarterIsCurrent}
                    onPrev={() =>
                      onSelectQuarterKey(addQuarters(selectedQuarterKey, -1))
                    }
                    onNext={() =>
                      onSelectQuarterKey(addQuarters(selectedQuarterKey, 1))
                    }
                    onToday={() => onSelectQuarterKey(currentQuarterKey)}
                    onTitleClick={() => setQuarterCollapsed((v) => !v)}
                    titleExpanded={!quarterCollapsed}
                    countPill={
                      quarterCollapsed && quarterlyRocks.length > 0
                        ? `${quarterlyRocks.filter((r) => r.completed).length}/${quarterlyRocks.length}`
                        : undefined
                    }
                  />
                  <CollapsibleBody open={!quarterCollapsed}>
                    <RockList
                      rocks={quarterlyRocks}
                      placeholder={
                        quarterIsCurrent
                          ? "Add a quarterly goal..."
                          : "Add a goal to this quarter..."
                      }
                      onAddRock={(text) => onAddRock(text, "quarter")}
                      onToggleRock={onToggleRock}
                      onDeleteRock={onDeleteRock}
                      onReorder={(rocks) => onReorderRocks(rocks, "quarter")}
                    />
                  </CollapsibleBody>
                </div>

                {/* This Year */}
                <div className="space-y-2">
                  <PeriodNav
                    title={yearIsCurrent ? "This Year" : "Year"}
                    rangeLabel={formatYearLabel(selectedYearKey)}
                    isCurrent={yearIsCurrent}
                    onPrev={() =>
                      onSelectYearKey(addYears(selectedYearKey, -1))
                    }
                    onNext={() =>
                      onSelectYearKey(addYears(selectedYearKey, 1))
                    }
                    onToday={() => onSelectYearKey(currentYearKey)}
                    onTitleClick={() => setYearCollapsed((v) => !v)}
                    titleExpanded={!yearCollapsed}
                    countPill={
                      yearCollapsed && yearlyRocks.length > 0
                        ? `${yearlyRocks.filter((r) => r.completed).length}/${yearlyRocks.length}`
                        : undefined
                    }
                  />
                  <CollapsibleBody open={!yearCollapsed}>
                    <RockList
                      rocks={yearlyRocks}
                      placeholder={
                        yearIsCurrent
                          ? "Add a yearly goal..."
                          : "Add a goal to this year..."
                      }
                      onAddRock={(text) => onAddRock(text, "year")}
                      onToggleRock={onToggleRock}
                      onDeleteRock={onDeleteRock}
                      onReorder={(rocks) => onReorderRocks(rocks, "year")}
                    />
                  </CollapsibleBody>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
