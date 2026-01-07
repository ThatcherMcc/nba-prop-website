"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  PlayerGameLog,
  PLAYER_STAT_TYPE,
  PLAYER_STAT_NAMES,
} from "@/db/schema";
import { getPlayerData } from "@/lib/data";
import { ALL_PLAYER_NAMES } from "@/lib/playerNames";

// Dynamic imports for SSR safety and efficiency
const PlayerChartDisplay = dynamic(() => import("./PlayerChartDisplay"), {
  ssr: false,
});
const PlayerCard = dynamic(() => import("./PlayerCard"), { ssr: false });

// Pulls and presents player data based on the player name, stat, and prop line
export default function PlayerSearch() {
  // Variables that define what to search for in the db
  const [playerName, setPlayerName] = useState("");
  const [selectedStat, setSelectedStat] = useState<PLAYER_STAT_TYPE>("pts");
  const [propLineInput, setPropLineInput] = useState<string>("0");

  // Fetched data
  const [playerData, setPlayerData] = useState<PlayerGameLog[]>([]);

  const [numericPropLine, setNumericPropLine] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  // Tracks if a valid player has been found and their data loaded
  const [playerFound, setPlayerFound] = useState(false);

  /**
   * On the change of the input, display new input
   * @param e Input element "search bar"
   */
  const handlePropLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Captures raw string input
    const value = e.target.value;
    setPropLineInput(value);

    if (value === "") {
      setNumericPropLine(null);
    } else {
      const parsedValue = parseFloat(value);
      // Check if the parsed value is a valid number (e.g., handles "20.5" but rejects "abc")
      if (!isNaN(parsedValue)) {
        setNumericPropLine(parsedValue);
      } else {
        setNumericPropLine(null);
      }
    }
  };

  /**
   * Measures hit rate by filtering the data for the entries over the prop line
   * Returns propline that defaults to 0 & hit rate.
   */
  const { propLine, hitRate } = useMemo(() => {
    // Use the safe numeric value, defaulting to 0 if null/empty
    const calculatedPropLine = numericPropLine ?? 0;

    const gamesOver = playerData.filter(
      (game) =>
        // Ensure type safety and handle potential null stat values
        ((game[selectedStat] as number | null) ?? 0) > calculatedPropLine
    ).length;

    const hitRatePercentage =
      playerData.length > 0 ? (gamesOver / playerData.length) * 100 : 0;

    return {
      // Pass the numeric value back as propLine
      propLine: calculatedPropLine,
      hitRate: hitRatePercentage.toFixed(1),
    };
  }, [playerData, selectedStat, numericPropLine]);

  /**
   * Changes on playerName change
   * If the player name isn't valid reset variables
   * Otherwise, fetch player data and respectively set variables respectively.
   */
  useEffect(() => {
    // Name is empty or not a name in the total list of player names. Set data to empty.
    if (!playerName || !ALL_PLAYER_NAMES.includes(playerName)) {
      setPlayerData([]);
      setLoading(false);
      setPlayerFound(false);
      return;
    }
    setLoading(true);
    // Name is in the list. Returns that player's data
    const fetchAndSetData = async () => {
      const data = await getPlayerData(playerName);
      setPlayerData(data);
      setLoading(false);
      // Check if the name is in ALL_PLAYER_NAMES to set playerFound to true here.
      setPlayerFound(true);

      // Reset stat/prop line when a new player is successfully loaded
      setSelectedStat("pts");
      setPropLineInput("0");
      setNumericPropLine(0);
    };
    fetchAndSetData();
  }, [playerName]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      {/* TOP NAV BAR */}
      <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg">🏀</span>
            PROP<span className="text-blue-500">ANALYZER</span>
          </h1>
  
          <div className="flex-1 max-w-xl mx-10 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              list="player-suggestions"
              placeholder="Search NBA Players (e.g. LeBron James)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-zinc-600 shadow-inner"
            />
          </div>
        </div>
      </nav>
  
      <main className="max-w-7xl mx-auto p-6">
        {loading && (
          <div className="flex items-center gap-3 text-blue-400 font-medium animate-pulse">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Analyzing database...
          </div>
        )}
  
        {playerFound && !loading && (
          <div className="grid grid-cols-12 gap-8 mt-4">
            
            {/* LEFT COLUMN: PLAYER PROFILE */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-square bg-gradient-to-b from-blue-600/20 to-transparent relative">
                  <Image 
                    src="/LebronPic.png" 
                    fill 
                    className="object-contain p-4" 
                    alt={playerName} 
                  />
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Stat</label>
                      <select
                        value={selectedStat}
                        onChange={(e) => setSelectedStat(e.target.value as PLAYER_STAT_TYPE)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        {PLAYER_STAT_NAMES.map((stat) => (
                          <option key={stat} value={stat}>{stat.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
  
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Line</label>
                      <input
                        type="number"
                        step="0.5"
                        value={propLineInput}
                        onChange={handlePropLineChange}
                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {playerData.length > 0 && (
                <PlayerCard
                  playerName={playerName}
                  stat={selectedStat.toUpperCase()}
                  propLine={propLine}
                  hitRate={hitRate}
                />
              )}
            </div>
  
            {/* RIGHT COLUMN: CHART */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl h-full min-h-[500px]">
                <PlayerChartDisplay
                  data={playerData}
                  statKey={selectedStat}
                  propLine={propLine}
                />
              </div>
            </div>
  
          </div>
        )}
  
        {playerFound && !loading && playerData.length === 0 && (
          <div className="mt-10 p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-center">
            No recent game data found for <span className="font-bold">{playerName}</span>.
          </div>
        )}
      </main>
      
      <datalist id="player-suggestions">
        {ALL_PLAYER_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
