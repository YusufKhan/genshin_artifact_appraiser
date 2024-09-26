import { NextApiRequest, NextApiResponse } from 'next';
import 'enka-network-api'
import { EnkaClient } from 'enka-network-api';
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
    console.log("UID received:", uid);
    const user = await enkaClient.fetchUser(uid);
    const characters = user.characters;
    const formattedCharacterRVs: string[][] = [];
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
        "FIGHT_PROP_BASE_HP": 0,
        "FIGHT_PROP_BASE_ATTACK" : 0,
        "FIGHT_PROP_BASE_DEFENSE" : 0
    } as const;
    type SubstatKeys = keyof typeof substatMaxValues;

    type CharacterData = {
        Properties: string[];
        Alhatham: number[];
        Arlecchino: number[];
        Hutao: number[];
        Shougun: number[];
        Fischl: number[];
        Furina: number[];
        Eula: number[];
        [key: string]: string[] | number[]; // Index signature
      };
    const teams: CharacterData = {
        Properties: ["FIGHT_PROP_HP","FIGHT_PROP_ATTACK","FIGHT_PROP_DEFENSE","FIGHT_PROP_HP_PERCENT",
                       "FIGHT_PROP_ATTACK_PERCENT",
                       "FIGHT_PROP_DEFENSE_PERCENT","FIGHT_PROP_CRITICAL","FIGHT_PROP_CRITICAL_HURT",
                       "FIGHT_PROP_CHARGE_EFFICIENCY","FIGHT_PROP_ELEMENT_MASTERY","FIGHT_PROP_BASE_HP",
                       "FIGHT_PROP_BASE_ATTACK","FIGHT_PROP_BASE_DEFENSE"],
            //[ HP, ATK, DEF, HP%, ATK%, DEF%, CR, CDMG, ER, EM ]
        Alhatham: [0,0.3,0,0,0.8,0,2.2,2.3,1.4,0.8,0.3],
        Arlecchino: [0, 0.49, 0, 0, 1.51, 0, 2.95, 2.33, 0, 1.33],
        Hutao: [0.62, 0.5, 0, 1.88, 1.07, 0, 3.2, 2.16, 0, 2.36],
        Shougun: [0, 0.53, 0, 0, 1.34, 0, 2.92, 2.43, 1.1, 0],
        Fischl: [0, 0.63, 0, 0, 1.41, 0, 2.62, 2.88, 0, 1.43],
        Furina: [0.93, 0, 0, 2.78, 0, 0, 1.19, 2.58, 2.78, 0],
        Eula: [0, 0.79, 0, 0, 2.4, 0, 1.57, 2.36, 2.4, 0],
    }

    if (characters.length === 0) {
        console.log("This user has no detailed characters on the profile.");
        return;
    }

    for (let j = 0; j < characters.length; j++) {
        // get artifacts stats and set bonuses from this character.
        const target = characters[j];
        const charName = target.characterData._nameId;
        const artifacts = target.artifacts;
        let totalScore = 0;

        if(teams.hasOwnProperty(charName)){
            //const teamMultipliers = teams[charName];
        }
        else{
            //console.log("Team multipliers not specified for ",charName);
            //const teamMultipliers = 0;
            continue;
        }
        
        const characterRVs = [];
        //Add the character name to the beginning of the RV array
        characterRVs.push(charName);
        
        for (let i = 0; i < artifacts.length; i++) {
            const artifact = artifacts[i];
            
            const rv = artifact.substats.total // Only include substats
            .map(stat => {
                const substatType = stat.fightProp.toString() as SubstatKeys;
                
                // Type guard to ensure substatType is a valid key
                if (!(substatType in substatMaxValues)) {
                console.error(`Invalid substat type: ${substatType}`);
                return 0; // Handle invalid substat type
                }
                const max = substatMaxValues[substatType];
                const multipliedValue = stat.getMultipliedValue();
                const substatIndex = teams["Properties"].indexOf(stat.fightProp); // Find index of the substat
                const multiplier = substatIndex !== -1 ? teams[charName][substatIndex] as number : 0; // Get multiplier from teams[charName]
                const normalizedValue = multipliedValue / max * multiplier; // Multiply normalized value by multiplier
                return normalizedValue;
            })
            .reduce((a, b) => {
                return a + b; 
            }, 0);
            
            characterRVs.push(rv); // Add rv to the rollValues array
        }
        // Format numbers to .2f before joining
        const formattedRVs = characterRVs.map(value => {
            if (typeof value === 'number') {
              totalScore = totalScore + value;
              return value.toFixed(2);
            } else {
                return value; //Cuts the names short for table formatting
            }
        });
        formattedRVs.push(totalScore.toFixed(2));
        formattedCharacterRVs.push(formattedRVs);
        //console.log(formattedCharacterRVs.join("\t")); // Output with tabs and formatting

    }
    //formattedCharacterRVs.forEach(row => {console.log(row.join("\t"));});
    
      // Return the 2D array if needed
    return formattedCharacterRVs;
}
