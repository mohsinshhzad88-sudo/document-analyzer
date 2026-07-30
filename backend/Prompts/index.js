const generalPrompt = require("./general");
const storyNovelPrompt = require("./storyNovel");
const schemas = require("./outputSchemas");


function getPrompt(documentType) {

      let schema = schemas.general;

    switch(documentType) {

          case  "Story/Novel":
            schema = schemas.story;
            return{
                prompt: storyNovelPrompt(),
                schema: schema
            };
            return storyNovelPrompt;

         default:
            return {
               prompt: generalPrompt(),
               schema: schema
            };
            
           

    }

}


module.exports = getPrompt;