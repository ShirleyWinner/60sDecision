using System;
using UnityEngine;

[Serializable]
public class DecisionOption
{
    public string decisionId;

    public string displayText;

    [TextArea(2, 4)]
    public string outcomeText;
}