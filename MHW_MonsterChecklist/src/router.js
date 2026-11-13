import express from 'express';
const router = express.Router();
export default router;

router.get('/', (req, res) => {
    
    res.render('index.html', {
        headerTitle:"Bestiario Monster Hunter"       
    });

});


router.get('/details', (req,res)=>{
    
    res.render('details.html',{
        //Hardcodeado, usaremos Params
        headerTitle:"Yermo Agujas"        
    });
});

router.get('/form_index', (req,res)=>{
    
    res.render('formIndex.html',{
        
    });
});

//Function to create Monsters
router.get('/create_monster', (req,res)=>{
    
    res.render('details.html',{
        
    });
});

