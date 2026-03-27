import { useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CollapsibleFilter } from "../CollapsibleFilter";
import {
  JOB_CATEGORIES,
  CANDIDATE_CATEGORIES,
  LOCATIONS_BY_ISLAND,
} from "../../data/mockData";

export type MarketplaceFilterFields = {
  industries: string[];
  locations: string[];
  payRanges: string[];
  experience: string[];
  education: string[];
  skills: string[];
  jobCategories: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userRole: "seeker" | "employer";
  filters: MarketplaceFilterFields;
  setMultiSelectFilter: <K extends keyof MarketplaceFilterFields>(
    category: K,
    values: MarketplaceFilterFields[K]
  ) => void;
  islandFilters: string[];
  setIslandFilters: (v: string[]) => void;
  clearFilters: () => void;
  resultCount: number;
};

export function MarketplaceFilterModal({
  isOpen,
  onClose,
  userRole,
  filters,
  setMultiSelectFilter,
  islandFilters,
  setIslandFilters,
  clearFilters,
  resultCount,
}: Props) {
  const [manualLocationInput, setManualLocationInput] = useState("");

  const allKnownTowns = useMemo(
    () => new Set(Object.values(LOCATIONS_BY_ISLAND).flat()),
    []
  );

  const availableTowns =
    islandFilters.length > 0
      ? islandFilters.flatMap((island) => LOCATIONS_BY_ISLAND[island] || [])
      : Object.values(LOCATIONS_BY_ISLAND).flat();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Refine Results">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            {userRole === "seeker" ? "Job Filters" : "Talent Filters"}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-[10px] font-black text-[#A63F8E] uppercase tracking-widest hover:underline hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Clear All
          </button>
        </div>

        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Hold Cmd/Ctrl to select multiple
        </p>

        <CollapsibleFilter title="Location" isOpen={userRole === "employer"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Islands
              </p>
              <select
                multiple
                value={islandFilters}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (o) => o.value
                  );
                  setIslandFilters(selected);

                  const validTowns = selected.flatMap(
                    (island) => LOCATIONS_BY_ISLAND[island] || []
                  );
                  setMultiSelectFilter(
                    "locations",
                    selected.length === 0
                      ? filters.locations
                      : filters.locations.filter((loc) =>
                          validTowns.includes(loc) || !allKnownTowns.has(loc)
                        )
                  );
                }}
                className="w-full h-32 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {Object.keys(LOCATIONS_BY_ISLAND).map((isl) => (
                  <option key={isl} value={isl}>
                    {isl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Towns/Cities{" "}
                {islandFilters.length > 0 && `(from ${islandFilters.join(", ")})`}
              </p>
              <select
                multiple
                value={filters.locations}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "locations",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-40 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {availableTowns.map((town, idx) => (
                  <option key={`${town}-${idx}`} value={town}>
                    {town}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const next = manualLocationInput.trim();
                    if (!next) return;
                    if (filters.locations.includes(next)) {
                      setManualLocationInput("");
                      return;
                    }
                    setMultiSelectFilter("locations", [...filters.locations, next]);
                    setManualLocationInput("");
                  }}
                  placeholder="Manual entry (e.g., Poipu Beach)"
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = manualLocationInput.trim();
                    if (!next) return;
                    if (!filters.locations.includes(next)) {
                      setMultiSelectFilter("locations", [...filters.locations, next]);
                    }
                    setManualLocationInput("");
                  }}
                  className="h-10 px-3 rounded-xl border-2 border-[#148F8B]/30 text-[#148F8B] text-[10px] font-black uppercase tracking-widest"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </CollapsibleFilter>

        <CollapsibleFilter title="Industry" isOpen={true}>
          <select
            multiple
            value={filters.industries}
            onChange={(e) =>
              setMultiSelectFilter(
                "industries",
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="w-full h-44 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
          >
            {(userRole === "seeker"
              ? JOB_CATEGORIES.industries
              : CANDIDATE_CATEGORIES.industries
            ).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </CollapsibleFilter>

        {userRole === "seeker" ? (
          <>
            <CollapsibleFilter title="Job Category">
              <select
                multiple
                value={filters.jobCategories}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "jobCategories",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-44 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {JOB_CATEGORIES.jobCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>

            <CollapsibleFilter title="Pay Range">
              <select
                multiple
                value={filters.payRanges}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "payRanges",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-40 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {JOB_CATEGORIES.payRanges.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>
          </>
        ) : (
          <>
            <CollapsibleFilter title="Experience Level" isOpen={true}>
              <select
                multiple
                value={filters.experience}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "experience",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-36 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {CANDIDATE_CATEGORIES.experience.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>

            <CollapsibleFilter title="Skills">
              <select
                multiple
                value={filters.skills}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "skills",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-56 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {CANDIDATE_CATEGORIES.skills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>

            <CollapsibleFilter title="Education">
              <select
                multiple
                value={filters.education}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "education",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-36 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {CANDIDATE_CATEGORIES.education.map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>

            <CollapsibleFilter title="Target Pay">
              <select
                multiple
                value={filters.payRanges}
                onChange={(e) =>
                  setMultiSelectFilter(
                    "payRanges",
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
                className="w-full h-44 p-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-bold"
              >
                {CANDIDATE_CATEGORIES.targetPayRanges.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </CollapsibleFilter>
          </>
        )}

        <div className="pt-6">
          <Button
            className="w-full h-16 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={onClose}
          >
            Show {resultCount} Results
          </Button>
        </div>
      </div>
    </Modal>
  );
}
