// import multer from "multer";

// export const upload = multer({ storage: multer.diskStorage({}) })

import multer from "multer";

// තාවකාලිකව පින්තූරය සේව් වන තැන සහ නම සකස් කිරීම
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    // ෆයිල් එක ක්‍රෑෂ් නොවී අද්විතීය නමක් (Unique Name) දීම
    callback(null, Date.now() + "-" + file.originalname);
  }
});

export const upload = multer({ storage });