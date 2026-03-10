runAfterLoad(function(){

// ---------- ELEMENT CREATOR ----------
function elem(name,color,behavior,category="biology"){
    elements[name]={color,behavior,category,state:"solid",reactions:{}};
}
function spawnImmune(x,y,type,chance=0.003){if(Math.random()<chance) createPixel(type,x,y);}
function randomOffset(){return [-1,0,1][Math.floor(Math.random()*3)];}
function moveIfEmpty(x,y,nx,ny){if(nx<0||ny<0||nx>=width||ny>=height) return; if(!pixelMap[nx][ny]) movePixel(x,y,nx,ny);}

// ---------- BLOOD VESSELS ----------
elem("blood","#b71c1c",behaviors.LIQUID,"biology");
elem("artery","#d32f2f",behaviors.WALL,"vessel");
elem("vein","#1976d2",behaviors.WALL,"vessel");
elem("lymph","#e6ee9c",behaviors.LIQUID,"biology");

// ---------- ORGANS ----------
const organs=["brain","heart","lung","liver","kidney","pancreas","muscle"];
const organColors=["#9c27b0","#e53935","#90caf9","#ff7043","#42a5f5","#8d6e63","#7cb342"];
organs.forEach((o,i)=>elem(o,organColors[i],behaviors.WALL,"organs"));

// ---------- IMMUNE CELLS ----------
const immuneCells=["macrophage","#ff9800","neutrophil","#ffee58","dendritic_cell","#8bc34a",
"b_cell","#4caf50","memory_b_cell","#1b5e20","t_helper","#03a9f4",
"cytotoxic_t","#1e88e5","memory_t","#0d47a1","nk_cell","#e91e63"];
for(let i=0;i<immuneCells.length;i+=2) elem(immuneCells[i],immuneCells[i+1],behaviors.POWDER,"immune");

// ---------- IMMUNE MOLECULES ----------
elem("antibody","#7e57c2",behaviors.LIQUID,"immune");
elem("cytokine","#26c6da",behaviors.GAS,"immune");
elem("interferon","#00acc1",behaviors.GAS,"immune");

// ---------- PATHOGENS ----------
const bacteria=["e_coli","staphylococcus","mrsa","salmonella","pseudomonas","tuberculosis"];
const viruses=["influenza","coronavirus","hiv","ebola","rabies"];
const fungi=["candida","aspergillus","candida_auris"];
const parasites=["malaria"];
bacteria.forEach(b=>elem(b,"#ff7043",behaviors.LIQUID,"bacteria"));
viruses.forEach(v=>elem(v,"#8e24aa",behaviors.GAS,"virus"));
fungi.forEach(f=>elem(f,"#eeeeee",behaviors.POWDER,"fungi"));
parasites.forEach(p=>elem(p,"#cddc39",behaviors.LIQUID,"parasite"));

// ---------- MEDICINES ----------
const medicines=["penicillin","amoxicillin","vancomycin","ciprofloxacin","rifampicin","fluconazole","amphotericin_b","oseltamivir","remdesivir","vaccine"];
medicines.forEach(m=>elem(m,"#42a5f5",behaviors.LIQUID,"medicine"));

// ---------- IMMUNE ATTACK & MEMORY ----------
elements.macrophage.reactions.e_coli={elem2:null};
elements.macrophage.reactions.salmonella={elem2:null};
elements.neutrophil.reactions.staphylococcus={elem2:null};
elements.t_cell.reactions.influenza={elem2:null};
elements.nk_cell.reactions.coronavirus={elem2:null};
elements.b_cell.reactions.influenza={elem1:"memory_b_cell",chance:0.6};
elements.memory_b_cell.reactions.influenza={elem1:"antibody",chance:1};
elements.vaccine.reactions.b_cell={elem1:"t_cell",chance:0.5};

// ---------- BLOOD FLOW + CHEMOTAXIS + FEVER + ORGAN FAILURE ----------
const oldTick=tick;
tick=function(){
    oldTick();
    for(let x=0;x<width;x++){
        for(let y=0;y<height;y++){
            let p=pixelMap[x][y];
            if(!p) continue;

            // BLOOD FLOW
            if(p.element==="blood"){
                moveIfEmpty(x,y,x+1,y); // directional
                moveIfEmpty(x,y,x,y+1);
                spawnImmune(x,y,"neutrophil",0.004);
                spawnImmune(x,y,"macrophage",0.003);
                spawnImmune(x,y,"b_cell",0.002);
                spawnImmune(x,y,"t_cell",0.002);
                spawnImmune(x,y,"nk_cell",0.001);
            }

            // IMMUNE CHEMOTAXIS
            if(["macrophage","neutrophil","b_cell","t_cell","nk_cell"].includes(p.element)){
                [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                    const nx=x+dx,ny=y+dy;
                    const np=pixelMap[nx]?.[ny];
                    if(np && (bacteria.concat(viruses).concat(fungi).concat(parasites).includes(np.element))) movePixel(x,y,nx,ny);
                });
            }

            // CYTOKINE STORM + FEVER
            if(organs.includes(p.element)){
                let cytokines=0;
                [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                    const np=pixelMap[x+dx]?.[y+dy];
                    if(np && np.element==="cytokine") cytokines++;
                });
                if(cytokines>1) elements[p.element].color="#ff0000"; // inflamed
                else elements[p.element].color=organColors[organs.indexOf(p.element)]; // normal
            }

            // ORGAN FAILURE
            if(organs.includes(p.element)){
                let infection=0;
                [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
                    const np=pixelMap[x+dx]?.[y+dy];
                    if(np && (bacteria.concat(viruses).concat(fungi).concat(parasites).includes(np.element))) infection++;
                });
                if(infection>2) elements[p.element].color="#000000"; // dead
            }

            // PATHOGEN MUTATION
            if((bacteria.concat(viruses).concat(fungi).concat(parasites).includes(p.element)) && Math.random()<0.0005){
                p.element="resistant_bacteria";
            }

        }
    }
};

console.log("🔥 Ultimate Body V4 - Full Pixel Simulator Loaded 🔥");

});
