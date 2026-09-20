using UnityEngine;

[System.Serializable]
public class RouteGroundTruth
{
    public string decisionId;
    public string routeName;

    public float distanceNM;
    public float expectedSpeedKnots;
    public float expectedTotalTimeHours;

    public float minDamageRiskPercent;
    public float maxDamageRiskPercent;

    public float deadlineBufferHours;

    [TextArea(2, 4)]
    public string calculationExplanation;
}

[CreateAssetMenu(
    fileName = "NewGroundTruth",
    menuName = "60sDecision/GroundTruth"
)]
public class GroundTruthData : ScriptableObject
{
    [Header("Mission")]
    public float directDistanceNM = 40f;
    public float normalCruiseSpeedKnots = 20f;
    public float deadlineHours = 5f;

    [Header("Storm")]
    public float stormSpeedKnots = 15f;
    public string stormDirection = "ENE";
    public float stormCoreRadiusNM = 15f;
    public float stormOuterRadiusNM = 30f;
    public float stormClearanceHours = 2.5f;

    [Header("Route Ground Truth")]
    public RouteGroundTruth[] routes;
}