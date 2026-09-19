using UnityEngine;

// Defines the type/source category of evidence.
public enum EvidenceType
{
    Intelligence,
    Weather,
    Sensor,
    HumanReport,
    Communication,
    Other
}

// Defines how reliable the evidence is.
public enum ReliabilityLevel
{
    Low,            
    Medium,
    High
}

// Defines how relevant the evidence is to the final decision.
public enum RelevanceLevel
{
    Low,
    Medium,
    High,
    Critical
}

[CreateAssetMenu(
    fileName = "NewEvidence",
    menuName = "60sDecision/Evidence"
)]
public class EvidenceData : ScriptableObject
{
    [Header("Identity")]
    public string evidenceId;
    public string title;

    [TextArea(2, 5)]
    public string content;

    [Header("Source")]
    public string sourceName;
    public EvidenceType evidenceType;

    [Header("Timing")]
    public float revealTimeSeconds;

    [Header("Decision Metadata")]
    public ReliabilityLevel reliability;
    public RelevanceLevel relevance;

    // ID of the final decision this evidence supports.
    // Leave empty for neutral/noise evidence.
    public string supportsDecisionId;

    [Header("Ground Truth")]
    public bool isTrue;
    public bool isCritical;

    [Header("Gameplay")]
    public float inspectTimeCostSeconds;

    [Header("UI")]
    public Sprite icon;
}
