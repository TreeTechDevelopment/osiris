const jwt = require('jsonwebtoken');

function tokenValidation(req, res, next){    
    if(req.headers['authorization']){        
        let header = req.headers['authorization']
        let token = header.split('-')
        if(token[0] === 'OSIRIS'){            
            req.token = token[1] 
            next()
        }
        else{ res.sendStatus(403) }
    }else{        
        res.sendStatus(403)
    }
}

module.exports = tokenValidation;