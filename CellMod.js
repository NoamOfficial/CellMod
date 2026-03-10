// Ultimate Body Mod V6 - Fully Functional Sandboxels
(function waitForSandboxels(){
    if(!window.Elements || !window.behaviors || !window.createPixel) {
        setTimeout(waitForSandboxels, 500); // wait 0.5s and try again
        return;
    }

    runAfterLoad(function(){

        const widthSafe = width;
        const heightSafe = height;

        // ---------- SAFE ELEMENT CREATION ----------
        function elem(name,color,behavior,category="biology"){
            if(!elements[name]){
                elements[name]={color:color,behavior:behavior,category:category,state:"solid",reactions:{}};
            }
        }

        function spawnSafe(name,x,y){
            if(x>=0 && y>=0 && x<widthSafe && y<heightSafe){
                createPixel(name,x,y);
            }
        }

        function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
        function chance(p){return Math.random()<p;}

        // ---------- ELEMENTS ----------
        // Blood & Vessels
        elem("blood","#b71c1c",behaviors.LIQUID,"biology");
        elem("artery","#d32f2f",behaviors.WALL,"vessel");
        elem("vein","#1976d2",behaviors.WALL,"vessel");
        elem("lymph","#e6ee9c",behaviors.LIQUID,"biology");

        // Organs
        const organs=["brain","heart","lung","liver","kidney","pancreas","muscle"];
        const organColors=["#9c27b0","#e53935","#90caf9","#ff7043","#42a5f5","#8d6e63","#7cb342"];
        organs.forEach((o,i)=>elem(o,organColors[i],behaviors.WALL,"organs"));

        // Immune Cells
        const immuneCells=["macrophage","#ff9800","neutrophil","#ffee58","b_cell","#4caf50",
        "memory_b_cell","#1b5e20","t_cell","#03a9f4","cytotoxic_t","#1e88e5","nk_cell","#e91e63"];
        for(let i=0;i<immuneCells.length;i+=2) elem(immuneCells[i],immuneCells[i+1],behaviors.POWDER,"immune");

        // Immune Molecules
        elem("antibody","#7e57c2",behaviors.LIQUID,"immune");
        elem("cytokine","#26c6da",behaviors.GAS,"immune");
        elem("interferon","#00acc1",behaviors.GAS,"immune");

        // Pathogens
        const bacteria=["e_coli","staphylococcus","mrsa","salmonella","pseudomonas","tuberculosis"];
        const viruses=["influenza","coronavirus","hiv","ebola","rabies"];
        const fungi=["candida","aspergillus","candida_auris"];
        const parasites=["malaria"];
        bacteria.forEach(b=>elem(b,"#ff7043",behaviors.LIQUID,"bacteria"));
        viruses.forEach(v=>elem(v,"#8e24aa",behaviors.GAS,"virus"));
        fungi.forEach(f=>elem(f,"#eeeeee",behaviors.POWDER,"fungi"));
        parasites.forEach(p=>elem(p,"#cddc39",behaviors.LIQUID,"parasite"));

        // Medicines
        const medicines=["penicillin","amoxicillin","vancomycin","ciprofloxacin","rifampicin","fluconazole","amphotericin_b","oseltamivir","remdesivir","vaccine"];
        medicines.forEach(m=>elem(m,"#42a5f5",behaviors.LIQUID,"medicine"));

        // ---------- IMMUNE REACTIONS ----------
        elements.macrophage.reactions.e_coli={elem2:null};
        elements.macrophage.reactions.salmonella={elem2:null};
        elements.neutrophil.reactions.staphylococcus={elem2:null};
        elements.t_cell.reactions.influenza={elem2:null};
        elements.nk_cell.reactions.coronavirus={elem2:null};
        elements.b_cell.reactions.influenza={elem1:"memory_b_cell",chance:0.6};
        elements.memory_b_cell.reactions.influenza={elem1:"antibody",chance:1};
        elements.vaccine.reactions.b_cell={elem1:"t_cell",chance:0.5};

        // ---------- SPAWN ORGAN SYSTEM ----------
        function spawnOrganSystem(offsetX=10, offsetY=10){
            const organMap=[
                {name:"brain",x:offsetX+10,y:offsetY},
                {name:"heart",x:offsetX+10,y:offsetY+5},
                {name:"lung",x:offsetX+5,y:offsetY+5},
                {name:"lung",x:offsetX+15,y:offsetY+5},
                {name:"liver",x:offsetX+10,y:offsetY+10},
                {name:"kidney",x:offsetX+5,y:offsetY+10},
                {name:"kidney",x:offsetX+15,y:offsetY+10},
                {name:"pancreas",x:offsetX+10,y:offsetY+12},
                {name:"muscle",x:offsetX+10,y:offsetY+15}
            ];
            organMap.forEach(o=>spawnSafe(o.name,o.x,o.y));

            for(let x=offsetX;x<offsetX+20;x++){
                for(let y=offsetY;y<offsetY+20;y++){
                    if(chance(0.15)) spawnSafe("artery",x,y);
                    if(chance(0.15)) spawnSafe("vein",x,y);
                    if(chance(0.2)) spawnSafe("blood",x,y);
                    if(chance(0.05)) spawnSafe("lymph",x,y);
                }
            }

            const immuneCellNames=["macrophage","neutrophil","b_cell","t_cell","nk_cell"];
            for(let i=0;i<50;i++){
                let x=randInt(offsetX,offsetX+19);
                let y=randInt(offsetY,offsetY+19);
                spawnSafe(immuneCellNames[randInt(0,immuneCellNames.length-1)],x,y);
            }
        }

        spawnOrganSystem(10,10);

        // ---------- TICK OVERRIDE ----------
        const oldTick=tick;
        tick=function(){
            oldTick();
            for(let x=0;x<widthSafe;x++){
                for(let y=0;y<heightSafe;y++){
                    const p=pixel[x][y];
                    if(!p) continue;

                    // Blood Flow
                    if(p.element==="blood"){
                        spawnSafe("blood",x+1,y);
                        spawnSafe("blood",x,y+1);
                        if(chance(0.004)) spawnSafe("neutrophil",x,y);
                        if(chance(0.003)) spawnSafe("macrophage",x,y);
                        if(chance(0.002)) spawnSafe("b_cell",x,y);
                        if(chance(0.002)) spawnSafe("t_cell",x,y);
                        if(chance(0.001)) spawnSafe("nk_cell",x,y);
                    }

                    // Immune Chemotaxis
                    if(["macrophage","neutrophil","b_cell","t_cell","nk_cell"].includes(p.element)){
                        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                            const nx=x+dx,ny=y+dy;
                            if(nx<0||ny<0||nx>=widthSafe||ny>=heightSafe) return;
                            const np=pixel[nx][ny];
                            if(np && (bacteria.concat(viruses).concat(fungi).concat(parasites).includes(np.element))){
                                movePixel(x,y,nx,ny);
                            }
                        });
                    }

                    // Organ inflammation
                    if(organs.includes(p.element)){
                        let cytokines=0;
                        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                            const np=pixel[x+dx]?.[y+dy];
                            if(np && np.element==="cytokine") cytokines++;
                        });
                        if(cytokines>1) elements[p.element].color="#ff0000";
                        else elements[p.element].color=organColors[organs.indexOf(p.element)];
                    }

                    // Organ failure
                    if(organs.includes(p.element)){
                        let infection=0;
                        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                            const np=pixel[x+dx]?.[y+dy];
                            if(np && (bacteria.concat(viruses).concat(fungi).concat(parasites).includes(np.element))) infection++;
                        });
                        if(infection>2) elements[p.element].color="#000000";
                    }
                }
            }
        };

        console.log("🔥 Ultimate Body V6 Fully Functional Sandboxels Mod Loaded 🔥");

    });

})();
