import APP from './root.app'

const PORT = process.env.PORT || 4000

APP.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
