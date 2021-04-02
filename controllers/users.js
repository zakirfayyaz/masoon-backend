// @desc GET all users
// @route GET api/v1/users
// @access Public

exports.getUsers = (req,res,next)=>{
    res.status(201).json({
        message: 'Get all users'
    })
}


// @desc GET single user
// @route GET api/v1/users/:id
// @access Public

exports.getUser = (req,res,next)=>{
    res.status(201).json({
        message: 'Get single user'
    })
}

// @desc Create new User
// @route POST api/v1/users/
// @access Private(need to be signed in)

exports.createUser = (req,res,next)=>{
    res.status(201).json({
        message: 'create user'
    })
}

// @desc Update User
// @route POST api/v1/users/:id
// @access Private(need to be signed in)

exports.updateUser = (req,res,next)=>{
    res.status(201).json({
        message: 'update user'
    })   
}

// @desc Delete User
// @route POST api/v1/users/:id
// @access Private(need to be signed in)

exports.deleteUser = (req,res,next)=>{
    res.status(201).json({
        message: 'delete user'
    })   
}