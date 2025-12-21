// ==========================================
// UltimateCellMod.js - FULL READY HUMAN BODY SIMULATOR
// Safe, self-contained, ready to host
// ==========================================

if(!window.Elements) throw new Error("[UltimateCellMod] Sandboxels Elements object not found!");

(function(){
    console.log("[UltimateCellMod] Initializing...");

    // ---------- HELPERS ----------
    function ensure(name,color="#bfbfbf",behavior=behaviors.POWDER,category="bio"){
        if(!elements[name]) elements[name]={color,behavior,category,reactions:{}};
    }
    function spawnRand(e,count=1){for(let i=0;i<count;i++){spawnPixel(Math.floor(Math.random()*width),Math.floor(Math.random()*height),elements[e]);}}

    // ---------- METABOLITES ----------
    const metabolites=["glucose","glucose_6_phosphate","fructose_6_phosphate","atp","nadh","fadh2","oxaloacetate","acetyl_coa","pyruvate","acetaldehyde","acetate","acetyl","propionyl_coa"];
    metabolites.forEach(m=>ensure(m,"#ffb74d"));

    // Simplified reaction chain
    elements.glucose.reactions["hexokinase"]={elem1:"glucose_6_phosphate",chance:1.0};
    elements.glucose_6_phosphate.reactions["pfk1"]={elem1:"fructose_6_phosphate",chance:1.0};
    elements.fructose_6_phosphate.reactions["pfk1"]={elem1:"fructose_6_phosphate",chance:1.0};

    // ---------- RNA & PROTEINS ----------
    ["dna","rna_polymerase","mrna","ribosome","protein"].forEach(e=>ensure(e));
    elements.dna.reactions["rna_polymerase"]={elem1:"mrna",chance:1.0};
    elements.mrna.reactions["ribosome"]={elem1:"protein",chance:1.0};

    // ---------- ORGANS ----------
    const organs=["liver","kidney","heart","muscle","brain","pancreas"];
    const organColors=["#ff7043","#42a5f5","#e53935","#7cb342","#ab47bc","#8d6e63"];
    organs.forEach((o,i)=>ensure(o,organColors[i],behaviors.POWDER,"organs"));

    elements.liver.reactions["epinephrine"]={elem1:"atp",elem2:"glucose",chance:0.8};
    elements.muscle.reactions["insulin"]={elem1:"glucose_6_phosphate",chance:0.4};
    elements.heart.reactions["norepinephrine"]={elem1:"atp",chance:0.5};
    elements.brain.reactions["glucose"]={elem1:"atp",chance:1.0};
    elements.kidney.reactions["ammonia"]={elem1:"urea",chance:1.0};

    // ---------- BLOOD & VESSELS ----------
    ["blood","artery","vein"].forEach(e=>ensure(e));
    const oldTick = window.tick;
    tick = function(){
        oldTick();
        for(let x=0;x<width;x++){
            for(let y=0;y<height;y++){
                const p=pixel[x][y];
                if(!p) continue;
                if(p.element=="blood"){
                    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                        const nx=x+dx, ny=y+dy;
                        if(nx<0||ny<0||nx>=width||ny>=height) return;
                        const np=pixel[nx][ny];
                        if(!np) return;
                        if(np.element=="artery"||np.element=="vein") spawnPixel(nx,ny,elements.blood);
                    });
                    metabolites.concat(["insulin","glucagon","cortisol","epinephrine","norepinephrine"]).forEach(m=>{
                        if(Math.random()<0.05) spawnPixel(x+1,y+1,elements[m]);
                    });
                }
            }
        }
    };

    // ---------- IMMUNE SYSTEM ----------
    ["white_blood_cell","antibody","virus","bacteria","fungus"].forEach(e=>ensure(e));
    ["virus","bacteria","fungus"].forEach(i=>{
        elements[i].reactions["blood"]={elem1:i,chance:0.2};
        organs.forEach(o=>elements[o].reactions[i]={elem1:null,chance:0.05,effect:()=>{elements[o].color="#000000";console.log(o+" failed due to "+i);}});
        elements[i].reactions["white_blood_cell"]={elem1:null,elem2:"antibody",chance:0.7};
    });

    // ---------- TOXINS ----------
    ensure("bongkrekic_acid","#6a1b9a",behaviors.LIQUID,"toxins");
    elements.bongkrekic_acid.reactions["blood"]={elem1:null,chance:1.0,effect:()=>{
        organs.forEach(o=>elements[o].color="#000000");
        console.log("DEATH: Bongkrekic acid ingested!");
    }};

    // ---------- HORMONES ----------
    ["insulin","glucagon","cortisol","epinephrine","norepinephrine"].forEach(e=>ensure(e));
    elements.liver.reactions["epinephrine"]={elem1:"atp",elem2:"glucose",chance:0.8};
    elements.muscle.reactions["insulin"]={elem1:"glucose_6_phosphate",chance:0.4};

    // ---------- FEEDBACK LOOPS ----------
    ensure("pancreas","#8d6e63");
    const oldTick2 = tick;
    tick = function(){
        oldTick2();

        // Blood glucose
        let glucoseCount=0;
        for(let x=0;x<width;x++){for(let y=0;y<height;y++){const p=pixel[x][y];if(!p) continue;if(p.element=="glucose") glucoseCount++;}}
        if(glucoseCount>50) spawnRand("insulin",3);
        else if(glucoseCount<20) spawnRand("glucagon",3);

        // Cortisol if ATP low
        let atpCount=0;
        for(let x=0;x<width;x++){for(let y=0;y<height;y++){const p=pixel[x][y];if(!p) continue;if(p.element=="atp") atpCount++;}}
        if(atpCount<30) spawnRand("cortisol",2);

        // Stress pulses
        if(Math.random()<0.01) spawnRand("epinephrine");
        spawnRand("norepinephrine");

        // Hormone decay
        ["insulin","glucagon","cortisol","epinephrine","norepinephrine"].forEach(h=>{
            for(let x=0;x<width;x++){for(let y=0;y<height;y++){const p=pixel[x][y];if(!p) continue;if(p.element==h && Math.random()<0.02) pixel[x][y]=null;}}
        });
    };

    console.log("[UltimateCellMod] FULLY READY human body simulator loaded ✔");
})();

