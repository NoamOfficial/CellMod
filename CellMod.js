// =====================================================
// ULTIMATE BIOLOGY v6 FINAL
// Full infection + immune + medicine simulation
// =====================================================

if (!window.elements) {
console.log("Sandboxels not loaded");
}

// =====================================================
// CORE FLUIDS
// =====================================================

elements.blood = {
color:"#b71c1c",
behavior:behaviors.LIQUID,
category:"biology"
};

elements.lymph = {
color:"#e6ee9c",
behavior:behaviors.LIQUID,
category:"biology"
};

// =====================================================
// IMMUNE CELLS
// =====================================================

function immune(name,color){

elements[name] = {
color:color,
behavior:behaviors.POWDER,
category:"immune",
reactions:{}
};

}

immune("macrophage","#ff9800");
immune("neutrophil","#ffee58");
immune("dendritic_cell","#8bc34a");
immune("b_cell","#4caf50");
immune("memory_b_cell","#1b5e20");
immune("t_helper","#03a9f4");
immune("cytotoxic_t","#1e88e5");
immune("memory_t","#0d47a1");
immune("nk_cell","#e91e63");

// =====================================================
// IMMUNE MOLECULES
// =====================================================

elements.antibody = {
color:"#7e57c2",
behavior:behaviors.LIQUID,
category:"immune"
};

elements.cytokine = {
color:"#26c6da",
behavior:behaviors.GAS,
category:"immune"
};

elements.interferon = {
color:"#00acc1",
behavior:behaviors.GAS,
category:"immune"
};

// fever effect
elements.cytokine.tick = function(pixel){
if (Math.random() < 0.01) {
pixel.temp += 2
}
}

// =====================================================
// BACTERIA
// =====================================================

function bacteria(name,color){

elements[name] = {
color:color,
behavior:behaviors.LIQUID,
category:"bacteria"
};

}

bacteria("staphylococcus","#f44336")
bacteria("mrsa","#c62828")
bacteria("streptococcus","#ef5350")
bacteria("e_coli","#ff7043")
bacteria("pseudomonas","#00695c")
bacteria("salmonella","#ff6f00")
bacteria("tuberculosis","#bf360c")

// mutation
elements.e_coli.tick = function(pixel){
if(Math.random()<0.0005){
changePixel(pixel,"resistant_bacteria")
}
}

elements.resistant_bacteria = {
color:"#5d4037",
behavior:behaviors.LIQUID,
category:"bacteria"
}

// =====================================================
// BIOFILM
// =====================================================

elements.biofilm = {
color:"#795548",
behavior:behaviors.WALL,
category:"bacteria"
}

elements.pseudomonas.reactions.pseudomonas = {
elem1:"biofilm",
chance:0.05
}

// =====================================================
// FUNGI
// =====================================================

function fungus(name,color){

elements[name] = {
color:color,
behavior:behaviors.POWDER,
category:"fungi"
};

}

fungus("candida","#eeeeee")
fungus("aspergillus","#9ccc65")
fungus("candida_auris","#cfd8dc")

// =====================================================
// VIRUSES
// =====================================================

function virus(name,color){

elements[name] = {
color:color,
behavior:behaviors.GAS,
category:"virus"
};

}

virus("influenza","#7b1fa2")
virus("coronavirus","#8e24aa")
virus("hiv","#4a148c")
virus("ebola","#311b92")
virus("rabies","#6a1b9a")

// =====================================================
// PARASITES
// =====================================================

elements.malaria = {
color:"#d4e157",
behavior:behaviors.LIQUID,
category:"parasite"
}

// =====================================================
// SEPSIS
// =====================================================

elements.sepsis = {
color:"#4e342e",
behavior:behaviors.GAS,
category:"disease"
}

elements.blood.reactions.salmonella = {
elem1:"sepsis",
chance:0.05
}

elements.blood.reactions.e_coli = {
elem1:"sepsis",
chance:0.05
}

// =====================================================
// ANTIBIOTICS
// =====================================================

function antibiotic(name,color){

elements[name] = {
color:color,
behavior:behaviors.LIQUID,
category:"antibiotic",
reactions:{}
};

}

antibiotic("penicillin","#2196f3")
antibiotic("amoxicillin","#42a5f5")
antibiotic("vancomycin","#5c6bc0")
antibiotic("ciprofloxacin","#26c6da")
antibiotic("azithromycin","#00acc1")
antibiotic("rifampicin","#ef6c00")

// targets

elements.penicillin.reactions.streptococcus = {elem2:null}
elements.penicillin.reactions.staphylococcus = {elem2:null}

elements.amoxicillin.reactions.e_coli = {elem2:null}

elements.vancomycin.reactions.mrsa = {elem2:null}

elements.ciprofloxacin.reactions.pseudomonas = {elem2:null}
elements.ciprofloxacin.reactions.salmonella = {elem2:null}

elements.rifampicin.reactions.tuberculosis = {elem2:null}

// =====================================================
// ANTIFUNGALS
// =====================================================

elements.fluconazole = {
color:"#66bb6a",
behavior:behaviors.LIQUID,
category:"antifungal"
}

elements.amphotericin_b = {
color:"#2e7d32",
behavior:behaviors.LIQUID,
category:"antifungal"
}

elements.fluconazole.reactions.candida = {elem2:null}
elements.amphotericin_b.reactions.aspergillus = {elem2:null}

// =====================================================
// ANTIVIRALS
// =====================================================

elements.oseltamivir = {
color:"#26c6da",
behavior:behaviors.LIQUID,
category:"antiviral"
}

elements.remdesivir = {
color:"#00acc1",
behavior:behaviors.LIQUID,
category:"antiviral"
}

elements.oseltamivir.reactions.influenza = {elem2:null}
elements.remdesivir.reactions.coronavirus = {elem2:null}

// =====================================================
// IMMUNE ATTACKS
// =====================================================

elements.macrophage.reactions.e_coli = {elem2:null}
elements.macrophage.reactions.salmonella = {elem2:null}

elements.neutrophil.reactions.staphylococcus = {elem2:null}

elements.nk_cell.reactions.influenza = {elem2:null}

elements.cytotoxic_t.reactions.coronavirus = {elem2:null}

// =====================================================
// ADAPTIVE IMMUNITY
// =====================================================

elements.b_cell.reactions.influenza = {
elem1:"memory_b_cell",
chance:0.6
}

elements.memory_b_cell.reactions.influenza = {
elem1:"antibody",
chance:1
}

// =====================================================
// BLOOD SPAWNS IMMUNE CELLS
// =====================================================

const oldTick = tick

tick = function(){

oldTick()

for (let x=0;x<width;x++){
for (let y=0;y<height;y++){

let p = pixelMap[x][y]
if (!p) continue

if(p.element === "blood"){

if(Math.random()<0.002)
createPixel("neutrophil",x,y)

if(Math.random()<0.002)
createPixel("macrophage",x,y)

if(Math.random()<0.001)
createPixel("b_cell",x,y)

if(Math.random()<0.001)
createPixel("t_helper",x,y)

}

}
}

}

console.log("Ultimate Biology v6 FINAL loaded")

