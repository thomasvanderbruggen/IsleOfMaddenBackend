
function calculatePasserRating (stats) { 
    let a = (stats.passCompPct - 30) * .05; 
    let b = (stats.passYdsPerAtt - 3) * .25; 
    let c = (stats.passTDs / stats.passAttempts) * 100 * .2;
    if (c > 2.375) c = 2.375;  
    let d = 2.375 - (stats.ints / stats.passAttempts * 100) * .25;
    return (a + b + c + d) / 6 * 100;  
}