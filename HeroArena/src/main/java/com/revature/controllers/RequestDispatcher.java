package com.revature.controllers;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;


import com.revature.delegates.FrontControllerDelegate;


public class RequestDispatcher {
	private Logger log = Logger.getLogger(RequestDispatcher.class);
	
	private Map<String, FrontControllerDelegate> delegateMap;
	{
		delegateMap = new HashMap<String, FrontControllerDelegate>();
		/*
		delegateMap.put("books", new BookDelegate());
		delegateMap.put("genres", new GenreDelegate());
		delegateMap.put("authors", new AuthorDelegate());
		delegateMap.put("login", new LoginDelegate());
		*/
	}
	public FrontControllerDelegate dispatch(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, ServletException {
			log.trace("Calling our request Delegate: "+ req.getRequestURI());
			// add cors headers
			addCorsHeader(req.getRequestURI(), resp);
			if("OPTIONS".equals(req.getMethod())) {
				// We already added the cors headers and are now done.
				return (r1, r2) -> {}; // empty delegate.
			}
			// Input: "BookStore/books"
			// Input: "BookStore/books/1"
			// Input: "BookStore/books/"
			StringBuilder switchString = new StringBuilder(req.getRequestURI());
			// remove context path
			switchString.replace(0, req.getContextPath().length()+1, "");
			/*
			 * books
			 * books/1
			 * books/
			 */
			// remove the first part of the string ending with /
			if(switchString.indexOf("/")!=-1) {
				// save the remains of the sting for later use in the delegates
				req.setAttribute("path", 
						switchString.substring(switchString.indexOf("/")+1));
				switchString.replace(switchString.indexOf("/"), switchString.length(), "");
			}
			return delegateMap.get(switchString.toString());
		}
	
	private void addCorsHeader(String requestURI, HttpServletResponse resp) {
		log.trace("adding headers");
		// TODO: to change the second argument
		resp.addHeader("Access-Control-Allow-Origin", "http://localhost:4200");
		resp.addHeader("Vary", "Origin");
		//if I don't care about getting my cookie, this will work
		//response.addHeader("Access-Control-Allow-Origin", "*");
        resp.addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, HEAD");
        resp.addHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept");
        resp.addHeader("Access-Control-Allow-Credentials", "true");
        resp.addHeader("Access-Control-Max-Age", "1728000");
        resp.addHeader("Produces", "application/json");
	}

}
