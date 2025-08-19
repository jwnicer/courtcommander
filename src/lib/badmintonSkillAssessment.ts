/**
 * Badminton Skill Assessment v1.0
 * Author: ChatGPT (for Johnwil)
 * Purpose: Drop-in module to assess badminton skill levels (A–F)
 * - Ordered determinants
 * - Weighted scoring
 * - Gating rules to prevent over-rating
 *
 * Usage:
 *   import { QUESTIONS, computeAssessment } from "./badmintonSkillAssessment";
 *   const answers: AnswerMap = {
 *     Q1: "B", Q2: "B", Q3: "C", Q4: "B", Q5: "B",
 *     Q6: "C", Q7: "B", Q8: "C", Q9: "B", Q10: "C"
 *   };
 *   const result = computeAssessment(answers);
 *   console.log(result);
 */

/** Letter scale used both for answer options and final level. */
export type Letter = "A" | "B" | "C" | "D" | "E" | "F";

/** Identifier keys for the questions (preserve order for weighting). */
export type QuestionId =
  | "Q1" | "Q2" | "Q3" | "Q4" | "Q5"
  | "Q6" | "Q7" | "Q8" | "Q9" | "Q10";

export interface Question {
  id: QuestionId;
  topic: string;
  prompt: string;
  /** Higher = more determinant. */
  weight: 1 | 2 | 3;
  /** Choice copy shown to users. */
  options: Record<Letter, string>;
}

export type AnswerMap = Partial<Record<QuestionId, Letter>>;

/** Points per letter for scoring. */
export const LETTER_POINTS: Record<Letter, number> = {
  A: 5, B: 4, C: 3, D: 2, E: 1, F: 0,
};

/** Helper to compare letters by strength (A strongest). */
export const compareLetters = (x: Letter, y: Letter) => LETTER_POINTS[x] - LETTER_POINTS[y];
export const atLeast = (x: Letter, min: Letter) => compareLetters(x, min) >= 0;

/** Threshold mapping from percentage to final preliminary level. */
export function pctToLevel(pct: number): Letter {
  if (pct >= 85) return "A";
  if (pct >= 70) return "B";
  if (pct >= 55) return "C";
  if (pct >= 40) return "D";
  if (pct >= 25) return "E";
  return "F";
}

/** Returns the lower (more restrictive) of two letters. */
export function minLevel(a: Letter, b: Letter): Letter {
  const order: Letter[] = ["A","B","C","D","E","F"]; // earlier = higher
  return order.indexOf(a) > order.indexOf(b) ? a : b;
}

/** Max raw points possible when all questions are answered. */
export const MAX_WEIGHT_SUM = 3+3+3+3+2+2+2+1+1+1; // 21
export const MAX_RAW = 5 * MAX_WEIGHT_SUM; // 105

/**
 * Core Q&A content (ordered by determinant strength)
 * Q1–Q4 are gating-critical.
 */
export const QUESTIONS: Question[] = [
  {
    id: "Q1",
    topic: "Footwork & Movement",
    prompt: "How would you rate your court movement (speed, balance, recovery to base)?",
    weight: 3,
    options: {
      A: "Very agile and balanced; recover to base quickly",
      B: "Good movement; minor slips; generally on time",
      C: "Average; occasionally late or off-balance",
      D: "Slow footwork; often out of position",
      E: "Struggles to move to shots in time",
      F: "Very slow/uncoordinated on court",
    },
  },
  {
    id: "Q2",
    topic: "Stroke Technique",
    prompt: "How consistent and varied are your strokes (serve, clear, drop, net, smash)?",
    weight: 3,
    options: {
      A: "Excellent, varied and precise across strokes",
      B: "Solid mechanics; reliable across most strokes",
      C: "Basic but serviceable; limited variety",
      D: "Inconsistent contact and placement",
      E: "Very limited mechanics; mostly basic pushes",
      F: "No reliable technique",
    },
  },
  {
    id: "Q3",
    topic: "Rally Consistency",
    prompt: "How well do you sustain rallies and control pace/placement?",
    weight: 3,
    options: {
      A: "Maintain long rallies, control depth and pace",
      B: "Hold medium rallies with few errors",
      C: "Short rallies; some unforced errors",
      D: "Frequent errors; struggle to build rallies",
      E: "Rarely sustain more than a few shots",
      F: "Cannot rally; lose shuttle quickly",
    },
  },
  {
    id: "Q4",
    topic: "Return of Serve & Smash Defense",
    prompt: "How confident are you returning serves and defending smashes?",
    weight: 3,
    options: {
      A: "Handle most with clean, controlled returns",
      B: "Return most; occasional difficulty",
      C: "Can return some; smashes trouble me",
      D: "Often struggle on both",
      E: "Rarely return effectively",
      F: "Cannot return",
    },
  },
  {
    id: "Q5",
    topic: "Anticipation / Reading Opponent",
    prompt: "How well do you read opponents and anticipate their shots?",
    weight: 2,
    options: {
      A: "Read very well; anticipate consistently",
      B: "Often anticipate correctly",
      C: "Sometimes anticipate; mixed",
      D: "Usually react late",
      E: "Rarely notice opponent cues",
      F: "No anticipation",
    },
  },
  {
    id: "Q6",
    topic: "Tactics & Shot Selection",
    prompt: "How strong is your positional play and shot selection?",
    weight: 2,
    options: {
      A: "Adapt plans; exploit weaknesses",
      B: "Good plans; vary shots well",
      C: "Basic ideas; some forced shots",
      D: "Mostly reactive; poor variations",
      E: "Frequent poor choices",
      F: "No strategy",
    },
  },
  {
    id: "Q7",
    topic: "Badminton-specific Fitness",
    prompt: "How well can you sustain match intensity (speed, endurance, recovery)?",
    weight: 2,
    options: {
      A: "Peak conditioning for fast pace",
      B: "Good stamina, can last long matches",
      C: "Decent fitness, but tire in tough games",
      D: "Get winded easily during intense rallies",
      E: "Low endurance, require frequent breaks",
      F: "Unable to sustain physical activity",
    },
  },
  {
    id: "Q8",
    topic: "Power",
    prompt: "How powerful are your clears and smashes?",
    weight: 1,
    options: {
        A: "Generate significant power, often winning points",
        B: "Good power, can hit deep clears and effective smashes",
        C: "Moderate power, sometimes clears are short",
        D: "Lack power, smashes are easy to return",
        E: "Very little power in any shots",
        F: "No power",
    },
  },
  {
    id: "Q9",
    topic: "Game Rules & Etiquette",
    prompt: "How familiar are you with official rules and on-court etiquette?",
    weight: 1,
    options: {
        A: "Know all rules and follow etiquette strictly",
        B: "Good knowledge of most rules and customs",
        C: "Know the basics of scoring and serving",
        D: "Unsure about many rules (e.g., foot faults)",
        E: "Very new to rules and how to behave on court",
        F: "No knowledge of rules",
    },
  },
  {
    id: "Q10",
    topic: "Mental Toughness",
    prompt: "How do you handle pressure and difficult moments in a match?",
    weight: 1,
    options: {
        A: "Thrive under pressure, stay focused and positive",
        B: "Handle pressure well, usually stay calm",
        C: "Can get frustrated but recover",
        D: "Often get rattled and make mistakes under pressure",
        E: "Easily discouraged by mistakes or losing points",
        F: "Cannot handle any pressure",
    },
  },
];


export interface AssessmentResult {
  rawScore: number;
  maxRawScore: number;
  percentage: number;
  preliminaryLevel: Letter;
  gatingLevel: Letter;
  finalLevel: Letter;
  notes: string[];
}

export function computeAssessment(answers: AnswerMap): AssessmentResult {
  const notes: string[] = [];
  let rawScore = 0;

  // 1. Calculate raw weighted score
  for (const q of QUESTIONS) {
    if (answers[q.id]) {
      rawScore += LETTER_POINTS[answers[q.id]!] * q.weight;
    }
  }

  const percentage = (rawScore / MAX_RAW) * 100;
  const preliminaryLevel = pctToLevel(percentage);
  notes.push(`Preliminary level based on weighted score of ${rawScore}/${MAX_RAW} (${percentage.toFixed(1)}%) is ${preliminaryLevel}.`);

  // 2. Gating Rules: You can't be better than your weakest core skill.
  // This prevents players from overrating themselves if they have a critical flaw.
  let gatingLevel: Letter = "A";
  const gatingQuestions = QUESTIONS.slice(0, 4); // Q1-Q4
  for (const q of gatingQuestions) {
    const answer = answers[q.id];
    if (answer) {
      gatingLevel = minLevel(gatingLevel, answer);
    } else {
        gatingLevel = "F"; // Missing answer to a critical question defaults to lowest
    }
  }
   if (gatingLevel !== "A") {
    notes.push(`Gating rule applied. Your level is capped at ${gatingLevel} due to your answer on a core skill (Footwork, Strokes, Rallies, or Defense).`);
  }


  // 3. Final level is the lower of the preliminary and gating levels.
  const finalLevel = minLevel(preliminaryLevel, gatingLevel);
   if (finalLevel !== preliminaryLevel) {
     notes.push(`Final level adjusted to ${finalLevel} from ${preliminaryLevel} due to gating rules.`);
   } else {
     notes.push(`Final level is ${finalLevel}.`);
   }

  return {
    rawScore,
    maxRawScore: MAX_RAW,
    percentage,
    preliminaryLevel,
    gatingLevel,
    finalLevel,
    notes,
  };
}
