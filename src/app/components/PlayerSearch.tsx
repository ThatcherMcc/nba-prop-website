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
    <div className="p-[40px] mx-auto my-0 bg-[#1e1e1e] min-h-screen text-[#f0f0f0]">
      {/** TOP HEADER */}
      <div className="flex items-center gap-10 border-b-2 border-gray-700 pb-6">
        {/** LOGO/TITLE */}
        <h1 className="text-4xl">🏀 NBA Prop Analyzer</h1>

        {/** SEARCH BAR CONTAINER */}
        <div className="flex-1 flex items-center">
          <input
            type="text"
            list="player-suggestions"
            placeholder="Select Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-md bg-[#2a2a2a] text-gray-100 text-base w-full"
          />
        </div>

        {/** NAME DATA TO DISPLAY IN INPUTS*/}
        <datalist id="player-suggestions">
          {ALL_PLAYER_NAMES.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      {/** STAT AND PROP LINE INPUTS */}
      {loading && <p style={{ color: "#007bff" }}>Loading Data...</p>}

      {/** PLAYER EXISTS, DISPLAY STAT & PROP INPUTS */}
      {playerFound && !loading && (
        <div className="flex gap-8 mt-6">
          {/** FLEX LEFT: STAT & INPUT SELECTIONS */}
          <div className="flex flex-col gap-4 flex-none w-1/3 pt-10">
            <Image src="/LebronPic.png" width={400} height={400} alt="" />
            <div className="flex flex-row gap-2">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-3xl">STAT :</h1>
                <select
                  value={selectedStat}
                  onChange={(e) =>
                    setSelectedStat(e.target.value as PLAYER_STAT_TYPE)
                  }
                  disabled={playerData.length === 0}
                  className="no-scrollbaroverflow-hidden flex-1 px-4 py-2 border border-gray-600 rounded-md bg-[#2a2a2a] text-gray-100 text-base cursor-pointer disabled:opacity-50"
                >
                  {PLAYER_STAT_NAMES.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prop Line Input */}
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-3xl">LINE :</h1>
                <input
                  type="number"
                  placeholder="Set Prop Line (e.g., 20.5)"
                  value={propLineInput}
                  onChange={handlePropLineChange}
                  disabled={playerData.length === 0}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-md bg-[#2a2a2a] text-gray-100 text-base disabled:opacity-50"
                />
              </div>
            </div>
            {playerData.length > 0 && numericPropLine !== null && (
              <PlayerCard
                playerName={playerName}
                stat={selectedStat.toUpperCase()}
                propLine={propLine}
                hitRate={hitRate}
              />
            )}
          </div>

          {/* FLEX RIGHT: PLAYER CARD & CHART */}
          {playerData.length > 0 && numericPropLine !== null && (
            <div className="flex flex-col gap-8 flex-1">
              {/* BOTTOM: PLAYER CHART */}
              <div className="min-h-[400px]">
                <PlayerChartDisplay
                  data={playerData}
                  statKey={selectedStat}
                  propLine={propLine}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLAYER FOUND, BUT THERES NO DATA */}
      {playerFound && !loading && playerData.length === 0 && (
        <p style={{ color: "#ffc107", marginTop: "20px" }}>
          No recent game log data found for **{playerName}**.
        </p>
      )}
    </div>
  );
}
