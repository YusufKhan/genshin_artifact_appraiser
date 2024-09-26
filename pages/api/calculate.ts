import { NextApiRequest, NextApiResponse } from 'next';
import 'enka-network-api'
import { EnkaClient } from 'enka-network-api';
//import { CharacterData } from '@/types';

const enkaClient = new EnkaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { uid } = req.body;

    // Perform your calculation or processing here
    const result = await performCalculation(uid);

    res.status(200).json({ result });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function performCalculation(uid: string) {

    const substatMaxValues = {
        "FIGHT_PROP_HP": 298.75,
        "FIGHT_PROP_ATTACK": 19.45,
        "FIGHT_PROP_DEFENSE": 23.15,
        "FIGHT_PROP_HP_PERCENT": 5.83,
        "FIGHT_PROP_ATTACK_PERCENT": 5.83,
        "FIGHT_PROP_DEFENSE_PERCENT": 7.29,
        "FIGHT_PROP_CRITICAL": 3.89,
        "FIGHT_PROP_CRITICAL_HURT": 7.77,
        "FIGHT_PROP_CHARGE_EFFICIENCY": 6.48,
        "FIGHT_PROP_ELEMENT_MASTERY": 23.31,
    }
    type SubstatKeys = keyof typeof substatMaxValues;
    
    const teams: Teams = { //%gain for character damage from one AVERAGE roll
        //              HP      ATK     DEF     HP%     ATK%    DEF%    CR      CDMG    ER      EM 
        Alhatham:   [   0,      0.3,    0,      0,      0.8,    0,      2.2,    2.3,    0,      1.1     ],
        Arlecchino: [   0,      0.49,   0,      0,      1.51,   0,      2.95,   2.33,   0,      1.33    ],
        Hutao:      [   0.62,   0.5,    0,      1.88,   1.07,   0,      3.2,    2.16,   0,      2.36    ],
        Shougun:    [   0,      0.53,   0,      0,      1.34,   0,      2.92,   2.43,   1.1,    0       ],
        Fischl:     [   0,      0.63,   0,      0,      1.41,   0,      2.62,   2.88,   0,      1.43    ],
        Furina:     [   0.93,   0,      0,      2.78,   0,      0,      1.19,   2.58,   0,      0       ],
        Eula:       [   0,      0.79,   0,      0,      2.4,    0,      1.57,   2.36,   0,      0       ],
    }
    interface Teams { [charName: string]: number[]; }

    console.log("UID received:", uid);
    const user = await enkaClient.fetchUser(uid);
    const characters = user.characters;
    if (characters.length === 0) {
        console.log("This user has no detailed characters on the profile.");
        return;
    }

    const allCharacterRVs: (string | number)[][] = [];
    //Iterate through each character

    for (let j = 0; j < characters.length; j++) {

        // get artifacts stats and set bonuses from this character.
        const target = characters[j];
        const charName = target.characterData._nameId;
        const artifacts = target.artifacts;
        console.log("Character: ",charName);

        if(!teams.hasOwnProperty(charName)){
            console.log("Team multipliers not specified for ",charName);
            continue;
        }
        if(artifacts.length < 5){
            console.log("Missing artifacts for ",charName);
            continue;
        }
        
        const characterRVs = [];
        let totalScore = 0;
        let totalMax = 0;
        //Add the character name to the beginning of the RV array
        characterRVs.push(charName);
        
        for (let i = 0; i < 5; i++) {
            const rv = artifacts[i].substats.total.map(stat => {
                
                // Type guard to ensure substatType is a valid key
                const substatType = stat.fightProp.toString() as SubstatKeys;
                if (!(substatType in substatMaxValues)) {
                console.error(`Invalid substat type: ${substatType}`);
                return 0; // Handle invalid substat type
                }
                
                //const max = substatMaxValues[substatType];
                const multipliedValue = stat.getMultipliedValue(); //Normalizes if percentage
                const substatIndex = Object.keys(substatMaxValues).indexOf(substatType);

                const meanValue = substatMaxValues[substatType]*0.85;
                const multiplier = teams[charName]?.[substatIndex] ?? 0;

                return (multipliedValue / meanValue) * multiplier;
            })
            .reduce((a, b) => { return a + b; }, 0);
            totalScore = totalScore + rv;
            characterRVs.push(rv.toFixed(2)); // Add artifact RV to the line

            //Max RV calc for this slot
            const removedSlot = [...teams[charName]];
            const slotType = artifacts[i].mainstat.fightProp.toString() as SubstatKeys;
            if (Object.keys(substatMaxValues).indexOf(slotType) !== -1) { //Only slicing if mainstat not in keys
                removedSlot.splice(Object.keys(substatMaxValues).indexOf(slotType), 1);
                //console.log(i," slot mainstat is in keys for ",charName);
            }   
            removedSlot.sort((a, b) => b - a);
            //Calc the max RV for this slot, scaled Mean roll increase to max
            const thisRVMax = ( 6*removedSlot[0] + removedSlot[1] + removedSlot[2] + removedSlot[3]) /0.85*1;
            characterRVs.push( thisRVMax );
            totalMax = totalMax + thisRVMax;

            // Percentage of RV to max RV converted to color and overwrite last value
            characterRVs[characterRVs.length-1] = getColorCode(rv / thisRVMax);
            console.log(i, " ", rv.toFixed(2), "\t", thisRVMax.toFixed(2));
        }
        characterRVs.push(totalScore.toFixed(2));
        characterRVs.push(totalMax);
        characterRVs[characterRVs.length-1] = getColorCode(totalScore/totalMax);
        console.log("Totals: ",totalScore.toFixed(2)," ",totalMax.toFixed(2));

        allCharacterRVs.push(characterRVs);
    }

    allCharacterRVs.sort((a, b) => {
        // Convert the elements at index 11 to numbers for comparison
        const numA = Number(a[11]);
        const numB = Number(b[11]);
    
        // Compare the numbers
        return numA - numB;
    });
    return allCharacterRVs;
}

function getColorCode(value: number) {
        const red = Math.min(255, Math.max(0, Math.round(255 * (1 - value)*0.8)));
        const green = Math.min(255, Math.max(0, Math.round(255 * (value)*0.8)));
        const alpha = Math.min(1, Math.max(0, 1-value)*0.8); // Scale opacity based on value
        return `rgba(${red},${green},0,${alpha})`;
}