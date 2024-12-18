const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
/**
 * GET /
 * HOME
 */
router.get("", async (req, res) => {
  try {
    const locals = {
      title: "Nodejs blog",
      description: "Simple Blog created with NodeJs , Express & MongoDb ",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

// router.get("", async (req, res) => {
//   try {
//     const locals = {
//       title: "Nodejs blog",
//       description: "Simple Blog created with NodeJs , Express & MongoDb ",
//     };

//     const data = await Post.find();
//     res.render("index", { locals, data });
//   } catch (error) {
//     console.log(error);
//   }
// });
async function insertPostData() {
  const dataToInsert = [];
  const requests = [];

  for (let i = 0; i < 2; i++) {
    requests.push(
      fetch("https://v2.jokeapi.dev/joke/Any?type=single")
        .then((response) => response.json())
        .then((data) => ({
          title: data.category,
          body: data.joke,
        }))
        .catch((error) => {
          console.error("Error fetching data:", error);
          return null;
        })
    );
  }

  const results = await Promise.all(requests);

  for (const result of results) {
    if (result !== null) {
      dataToInsert.push(result);
    }
  }

  if (dataToInsert.length > 0) {
    Post.insertMany(dataToInsert)
      .then(() => console.log("Data inserted successfully!"))
      .catch((error) => console.error("Error inserting data:", error));
  } else {
    console.error("No data to insert.");
  }
}
setInterval(insertPostData, 86400000);

insertPostData();

// function insertPostData() {
//   const dataToInsert = [];
//   for (var i = 0; i < 20; i++) {
//     fetch("https://v2.jokeapi.dev/joke/Any?type=single")
//       .then((response) => response.json())
//       .then((data) => {
//         dataToInsert[i] = { title: data.category, body: data.joke };
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }
//   Post.insertMany(dataToInsert);
//   // Post.insertMany([
//   //   {
//   //     title: "Building a blog",
//   //     body: "This is the body text ",
//   //   },
//   //   {
//   //     title: "Learn the basics of Node.js and its architecture",
//   //     body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers.",
//   //   },
//   //   {
//   //     title: "NodeJs Limiting Network Traffic",
//   //     body: "Learn how to limit netowrk traffic.",
//   //   },
//   //   {
//   //     title: "Learn Morgan - HTTP Request logger for NodeJs",
//   //     body: "Learn Morgan.",
//   //   },
//   // ]);
// }
// insertPostData();

/**
 * GET /
 * post._id
 */
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs , Express & MongoDb ",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * post - serchTerm
 */

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs , Express & MongoDb ",
    };

    let searchTerm = req.body.searchTerm;
    const searchSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

    const data = await Post.find({
      $or: [
        { title: new RegExp(searchSpecialChar, "i") },
        { title: new RegExp(searchSpecialChar, "i") },
      ],
    });
    res.render("search", {
      data,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about");
});
module.exports = router;
