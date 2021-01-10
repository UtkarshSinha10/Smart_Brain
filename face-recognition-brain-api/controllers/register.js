const handleRegister=(req,res,db,bcrypt)=>{

	const {email, name, password}=req.body;
	if(!email || !name || !password){
		return res.status(400).json('Incorrect form submission');
	}
	console.log(email,name,password);
	const hash =bcrypt.hashSync(password);
	// console.log('before transaction');
	db.transaction(trx=>{
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginemail=>{
			return trx('users')
			.returning('*')
			.insert({
				email:loginemail[0],
				name:name,
				joined:new Date()
			})
			.then(user=>{
				res.json(user[0]);
			})
			// console.log('in transaction');
		})
		.then(trx.commit)
		.catch(trx.rollback)
		// console.log('after transaction');
	})
	.catch(err=>res.status(400).json('Unable to register'));
}
module.exports={
	handleRegister:handleRegister
};
