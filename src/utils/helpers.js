const KG_TO_LBS = 2.20462;

export const convertToKg = (val, units) => (units === 'lbs' ? val / KG_TO_LBS : val);
const convertFromKg = (val, units) => (units === 'lbs' ? val * KG_TO_LBS : val);

export const formatWeight = (val, units) =>
    typeof val === 'number' && !isNaN(val)
        ? `${convertFromKg(val, units).toFixed(1)} ${units}`
        : '--';

export const calculateBMI = (weightKg, heightM) =>
    typeof weightKg === 'number' && typeof heightM === 'number' && weightKg > 0 && heightM > 0
        ? (weightKg / (heightM * heightM)).toFixed(1)
        : '--';

export const getBmiColor = (bmi) => {
    if (typeof bmi !== 'number') return 'text-slate-900';
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    if (bmi < 35) return 'text-orange-500';
    return 'text-red-500';
};