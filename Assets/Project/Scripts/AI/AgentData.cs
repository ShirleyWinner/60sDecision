using UnityEngine;

[CreateAssetMenu(
    fileName = "NewAgent",
    menuName = "60sDecision/Agent"
)]
public class AgentData : ScriptableObject
{
    [Header("Identity")]
    public string agentId;
    public string agentName;

    [TextArea(2, 4)]
    public string description;

    [Header("Agent Profile")]
    public string specialization;

    [Range(0f, 1f)]
    public float confidence;

    [Header("Recommendation")]
    public string recommendedDecisionId;

    [TextArea(2, 5)]
    public string recommendationText;

    [TextArea(2, 5)]
    public string reasoningSummary;

    [Header("Evidence")]
    public EvidenceData[] evidenceUsed;
    public EvidenceData[] evidenceMissing;

    [Header("UI")]
    public Sprite portrait;
}