export default (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
};