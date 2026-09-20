using UnityEngine;

public enum AIFailureType
{
    None,
    MissingInformation,
    OutdatedInformation,
    MisleadingInformation,
    CorruptedInput
}

[CreateAssetMenu(
    fileName = "NewScenario",
    menuName = "60sDecision/Scenario"
)]
public class ScenarioData : ScriptableObject
{
    [Header("Identity")]
    public string scenarioId;
    public string scenarioTitle;

    [TextArea(3, 7)]
    public string missionBrief;

    [Header("Game Rules")]
    public float totalTimeSeconds = 60f;

    [Header("Ground Truth")]
    public GroundTruthData groundTruth;

    [Header("Content")]
    public AgentData[] availableAgents;
    public EvidenceData[] evidence;

    [Header("Decision")]
    public DecisionOption[] decisionOptions;
    public string correctDecisionId;

    [Header("AI Debrief")]
    public AIFailureType aiFailureType;

    [TextArea(2, 5)]
    public string aiFailureExplanation;

    [TextArea(2, 5)]
    public string learningPoint;
}
