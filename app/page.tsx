"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const brailleMap: Record<string, string> = {
  "100000": "a",
  "101000": "b",
  "110000": "c",
  "110100": "d",
  "100100": "e",
  "111000": "f",
  "111100": "g",
  "101100": "h",
  "011000": "i",
  "011100": "j",
  "100010": "k",
  "101010": "l",
  "110010": "m",
  "110110": "n",
  "100110": "o",
  "111010": "p",
  "111110": "q",
  "101110": "r",
  "011010": "s",
  "011110": "t",
  "100011": "u",
  "101011": "v",
  "011101": "w",
  "110011": "x",
  "110111": "y",
  "100111": "z",
};

const EMPTY_DOTS = [0, 0, 0, 0, 0, 0];

export default function Home() {
  const [dots, setDots] = useState<number[]>(EMPTY_DOTS);
  const [text, setText] = useState("");
  const textRef = useRef<HTMLSpanElement>(null);

  // mengubah array ke string
  // contoh: Mengubah [1,0,0,0,0,0] → "100000"
  const key = dots.join("");
  // kalo bagian kiri falsy, pakai bagian kanan (dipisahkan OR)
  // dots.some untuk membedah apakah ada 1 dots yang bernilai 1 alias aktif, kalo ada, pakai tanda tanya, kalo ga, kosongin aja)
  const preview = brailleMap[key] || (dots.some((d) => d === 1) ? "?" : "");

  const toggleDot = (i: number) => {
    //balikkan ON <-> OF dot ke-i, dot lain tetap
    setDots((d) =>
      // d = contoh: [0, 1, 0, 1, 0, 0]
      d.map((v, idx) => {
        // v = value antara 0 atau 1
        // idx adalah index dots
        if (idx === i) {
          // kalo dots nya sesuai dengan yang mau diubah, maka ganti dari ON ke OFF atau sebaliknya.
          // kalo ngga, return in aja nilai awal (jangan diubah)
          return v === 1 ? 0 : 1;
        }
        return v;
      })
    );
  };

  const playAudio = (letter: string) => {
    // kalo huruf ada, maka akan dimainkan suara sesuai huruf
    if (letter) new Audio(`/audios/${letter}.mp3`).play();
  };

  const handleEnter = () => {
    // jika preview tidak ada, atau bernilai ?, maka tidak bisa diklik
    if (!preview || preview === "?") return;
    // menambahkan teks dengan preview huruf
    setText((t) => t + preview);
    playAudio(preview);
    // reset dots
    setDots(EMPTY_DOTS);
  };

  // ambil string index 0 smpe 1 karakter sebelum akhir
  // "halo".slice(0, -1) // "hal"
  const handleBackspace = () => setText((t) => t.slice(0, -1));

  // tambah 1 spasi
  const handleSpace = () => setText((t) => t + " ");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const actions: Record<string, () => void> = {
        Enter: handleEnter,
        Backspace: handleBackspace,
        " ": handleSpace,
      };

      if (actions[e.key]) {
        // mencegah prilaku bawaan browser
        e.preventDefault();
        e.stopPropagation();
        // ambil fungsi dari action lalu jalankan
        actions[e.key]!();
        return;
      }
      // regex artinya hanya ada 1 karakter dan 1-6 aja
      if (/^[1-6]$/.test(e.key)) {
        e.stopPropagation();
        toggleDot(Number(e.key) - 1);
      }
    };

    // tambahkan listener
    window.addEventListener("keydown", onKey);
    // hapus listenernya biar ga ketumpuk
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  return (
    <div className="w-[100vw] overflow-hidden h-[100dvh] relative flex justify-end">
      <Image
        src="/background.svg"
        width={100}
        height={100}
        alt="background"
        className="w-auto h-[120vh] sm:h-[130vh] object-cover shrink-0"
      />

      <header className="absolute w-[100vw] px-6 py-4 flex justify-center md:justify-start">
        <Image
          src="/logo.svg"
          width={100}
          height={100}
          alt="logo"
          className="w-auto h-9"
        />
      </header>

      <div className="w-[100vw] md:w-[50vw] flex justify-center absolute left-0 top-18 md:ml-12">
        <div className="w-[92%] sm:w-110 h-146 absolute bg-black opacity-50 md:bg-gradient-to-b from-[#1DBD7F] to-[#DBFD81] md:opacity-100 rounded-xl" />

        <div className="w-[92%] sm:w-110 h-146 z-2 flex flex-col items-center p-4">
          {/* Display */}
          <h1 className="w-[90%] bg-white py-3 px-4 rounded-md font-medium text-3xl shadow h-16 flex items-center gap-3 overflow-hidden">
            {/* TEXT */}
            <span
              ref={textRef}
              className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto whitespace-pre"
            >
              <span>{text}</span>
              <span className="animate-blink text-gray-600">▌</span>
            </span>

            {/* PREVIEW */}
            {preview && (
              <span className="min-w-[48px] flex-shrink-0 text-center px-3 py-1 text-2xl font-bold rounded-md bg-black/5 backdrop-blur-md shadow-sm">
                {preview}
              </span>
            )}
          </h1>

          {/* Braille dots */}
          <div className="w-[70%] sm:w-[50%] max-w-50 h-98 grid grid-cols-2 gap-x-6 pt-10 ">
            {dots.map((dot, i) => (
              <button
                key={i}
                onClick={() => toggleDot(i)}
                className={`
                  w-16 h-16 rounded-full
                  transition-all duration-200
                  active:scale-90
                  border-2 border-white/40
                  ${dot ? "bg-black shadow-md" : "bg-gray-300 shadow"}
                  hover:border-white
                  ${i % 2 ? "justify-self-end" : ""}
                `}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="w-[98%] flex gap-x-1 sm:gap-x-2 mt-4">
            <button
              onClick={handleBackspace}
              className="rounded-md h-13 flex-3 bg-[#FF5D5D] text-white font-medium shadow text-md sm:text-xl active:scale-95 transition"
            >
              Backspace
            </button>

            <button
              onClick={handleSpace}
              className="rounded-md h-13 flex-4 bg-white font-medium shadow text-md sm:text-xl active:scale-95 transition"
            >
              Space
            </button>

            <button
              onClick={handleEnter}
              disabled={!preview || preview === "?"}
              className={`rounded-md h-13 flex-3 bg-gradient-to-b from-[#1DBD7F] to-[#DBFD81] font-medium shadow text-md sm:text-xl active:scale-95 transition ${
                !preview || preview === "?"
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
