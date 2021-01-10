const handleProfileGet=(req,res,db)=>{
	const {id}=req.params;
	console.log(id);
	db.select('*').from('users').where({
		id:id
	}).then(user=>{
		if(user.length){
			res.json(user[0]);
		}
		else{
			res.status(404).json('Not found');
		}
	})
	.catch(err=>res.status(400).json('Error in getting user'))
	// if(!found){
	// 	res.status(404).json('no such user found');
	// }
}
module.exports={
	handleProfileGet
}