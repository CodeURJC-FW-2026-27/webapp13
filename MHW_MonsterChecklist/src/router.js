import express from 'express';

const router = express.Router();
export default router;

router.get('/', (req, res) => {
    
    res.render('index.html', {
        
    });

});


router.get('/details', (req,res)=>{
    
    res.render('details.html',{
        
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

