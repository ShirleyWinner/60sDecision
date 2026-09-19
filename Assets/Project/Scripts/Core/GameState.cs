using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public enum GameState
{
    Idle,
    ScenarioIntro,
    Playing,
    OutcomeReveal,
    Debrief
}

public enum OutcomeType
{
    CorrectDecision,
    IncorrectDecision,
    TimeOut
}
