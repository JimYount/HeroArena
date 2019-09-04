package com.revature.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.revature.beans.Gladiator;
import com.revature.beans.User;
import com.revature.data.GladiatorDAO;
import com.revature.data.UserDAO;

@Controller
@CrossOrigin
@RequestMapping(value="/user/roster")
public class UserController {
	@Autowired
	private UserDAO ud;
	@Autowired
	private GladiatorDAO gd;
	
	@GetMapping("{play}")
	@ResponseBody
	public Set<Gladiator> getRoster(@PathVariable("play") Integer id) {
		System.out.println("getRoster in UserController");
		User u = ud.getUser(id);
		return gd.getGladiatorsForUser(u);
	}
}