import Movie from "../Models/MoviesModel.js";
import { MoviesData } from "../Data/MovieData.js";

//*--------------Public Controller-----
const importMovies = async (req, res) => {
  await Movie.deleteMany({});
  const movies = await Movie.insertMany(MoviesData);
  res.status(201).json(movies);
};
const getMovies = async (req, res, next) => {
  try {
    //filter movies by category,time,language,rate,year
    const { category, time, language, rate, year, search } = req.query;
    let query = {
      ...(category && { category }),
      ...(time && { time }),
      ...(language && { language }),
      ...(rate && { rate }),
      ...(year && { year }),
      ...(search && { name: { $regex: search, $options: "i" } }),
    };

    //Load more movies function
    const page = Number(req.query.pageNumber) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    //get total number of movies
    const count = await Movie.countDocuments(query);
    res.json({
      movies,
      page,
      pages: Math.ceil(count / limit),
      totalMovies: count,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getMovieById = async (req, res, next) => {
  const movieId = req.params.id;
  try {
    const movie = await Movie.findById(movieId);

    if (movie) {
      res.json(movie);
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getTopRatedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({}).sort({ rate: -1 }).limit(8);
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getRadomMovies = async (req, res, next) => {
  try {
    const movies = await Movie.aggregate([{ $sample: { size: 8 } }]);
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//---------PRIVATE CONTROLLER--------
const createMovieReview = async (req, res, next) => {
  const movieId = req.params.id;
  const { rating, comment } = req.body;
  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      //NOT COMPLETE
      // const alreadyReviewed = movie.reviews.find(
      //   (r) => r.userId.toString() === req.user._id.toString()
      // );

      // if (alreadyReviewed) {
      //   res.status(400);
      //   throw new Error("You already reviewed this movie");
      // }
      const review = {
        userName: req.user.name,
        userId: req.user._id,
        userImage: req.user.image,
        rating: Number(rating),
        comment,
      };
      movie.reviews.push(review);
      movie.numberOfReviews = movie.reviews.length;
      const validRatings = movie.reviews.filter(
        (review) => !isNaN(review.rating)
      ); // Filter out NaN ratings
      const sumOfRatings = validRatings.reduce(
        (acc, review) => acc + review.rating,
        0
      );

      movie.rate = movie.rate = sumOfRatings / validRatings.length;
      await movie.save();
      res.status(201).json({
        message: "Review added",
      });
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateMovie = async (req, res, next) => {
  try {
    const {
      name,
      des,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      casts,
      video,
    } = req.body;
    const movieId = req.params.id;
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      movie.name = name || movie.name;
      movie.des = des || movie.des;
      movie.image = image || movie.image;
      movie.titleImage = titleImage || movie.titleImage;
      movie.rate = rate || movie.rate;
      movie.category = category || movie.category;
      movie.time = time || movie.time;
      movie.language = language || movie.language;
      movie.year = year || movie.year;
      movie.video = video || movie.video;
      movie.casts = casts || movie.casts;
      const updatedMovie = await movie.save();

      res.status(201).json(updatedMovie);
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      await movie.deleteOne();
      res.status(201).json({ message: "Delete Successful" });
    } else {
      res.status(404);
      throw new Error("Movie not found");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteAllMovies = async (res, req, next) => {
  try {
    await Movie.deleteMany({});
    res.json({ message: "All movies removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const createMovie = async (req, res, next) => {
  try {
    const {
      name,
      des,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      casts,
      video,
    } = req.body;
    const movie = new Movie({
      name,
      des,
      image,
      titleImage,
      rate,
      numberOfReviews,
      category,
      time,
      language,
      year,
      casts,
      video,
      userId: req.user._id,
    });

    if (movie) {
      const createdMovie = await movie.save();
      res.status(201).json(createdMovie);
    } else {
      res.status(400);
      throw new Error("Invalid movie data");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export {
  importMovies,
  getMovies,
  getMovieById,
  getTopRatedMovies,
  getRadomMovies,
  createMovieReview,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createMovie,
};
