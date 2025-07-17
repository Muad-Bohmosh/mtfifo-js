# Copyright (c) 2025 Muad Bohmosh
#
# This file is part of the MTFIFO project.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0


class MTFIFO {
  /**
   * @param {{THREADS: number}} options
   */
  constructor({ THREADS }) {

    if(!THREADS){
      throw new Error("{{THREADS}} param must be defined");
    }

    this.THREADS = THREADS;

    this.BUSY_THREADS = [];          // [{ index, request }]
    this.UNHANDLED = [];             // [{ params, func }]

    // Callbacks
    this.request_success_callback = response => {
      console.log("request_handled", response);
    };

    this.request_error_callback = response => {
      console.error(response);
    };

    this.request_END_callback = () => {
      console.log("all requests are handled");
    };

    this.running = false;            // Interval ID or false
    this._intervalMs = 50;           // Polling interval
  }

  /**
   * Register event callbacks:
   *  'SUCCESS' => on each request's successfull completion
   *  'ERROR'   => on each request's failed completion
   *  'END'     => when queue drains
   */

  on(event, callback) {
    const e = event.toUpperCase();
    if (e === 'SUCCESS') this.request_success_callback = callback;
    else if (e === 'ERROR') this.request_error_callback = callback;
    else if (e === 'END') this.request_END_callback = callback;
  }

  /**
   * Add one or more requests: { params: any, func: (params)=>Promise }
   * @param {Array|Object} reqs
   */
  add_requests(reqs) {
    if (!Array.isArray(reqs)) reqs = [reqs];
    for (const r of reqs) {
      if (!r || typeof r.func !== 'function') continue;
      this.UNHANDLED.push({ params: r.params, func: r.func });
    }

    if(!this.running){
      this.Start()
    }
  }

  /**
   * Get array of free thread indices.
   */
  get_free_threads() {
    const busy = new Set(this.BUSY_THREADS.map(b => b.index));
    const free = [];
    for (let i = 0; i < this.THREADS.length; i++) {
      if (!busy.has(i)) free.push(i);
    }
    return free;
  }

  /**
   * Internal: assign a request to a thread and handle completion.
   */
  handle_request(request, threadIdx) {
    // Mark busy
    this.BUSY_THREADS.push({ index: threadIdx, request });

    if (typeof this.THREADS[Number(threadIdx)] !== 'function'){
      throw new error(`thread number ${threadIdx} must be a function`);
    }

    // make sure Current_Thread is asynchronous
    const Current_Thread = ( async ()=>{

      return this.THREADS[Number(threadIdx)](request)

    } )

    Current_Thread().then((RESP) => {
      //this.AFTER_REQUEST_HANDLED_QEUE.push({ thread: threadIdx, request });

      // Invoke success callback
      this.request_success_callback(RESP);

      // Remove thread from busy list
      this.BUSY_THREADS = this.BUSY_THREADS.filter(b => b.index !== threadIdx);

      // Check for end condition
      this.checkIfDone()

    }).catch((e) => {
      // Handle error callback
      this.request_error_callback({ req: request, error: e });

      // Cleanup
      this.BUSY_THREADS = this.BUSY_THREADS.filter(b => b.index !== threadIdx);

      // Check for end condition
      this.checkIfDone()
    });


  }

  // once no requests are left to handle
  checkIfDone() {
    if (this.UNHANDLED.length === 0 && this.BUSY_THREADS.length === 0) {
      this.Stop();
      this.request_END_callback();
    }
  }

  /**
   * Start processing the queue. Polls every _intervalMs ms for free threads.
   */
  async Start() {
    // If already running, do nothing
    if (this.running) return;
    // Ensure any previous interval is cleared
    await this.Stop();

    // Kick off polling
    this.running = setInterval(() => {
      if (this.UNHANDLED.length === 0) return;
      const free = this.get_free_threads();
      // Assign FIFO
      for (const idx of free) {
        if (this.UNHANDLED.length === 0) break;
        const req = this.UNHANDLED.shift();
        this.handle_request(req, idx);
      }
    }, this._intervalMs);
  }

  /**
   * Stop the scheduler.
   */
  async Stop() {
    if (this.running) {
      clearInterval(this.running);
      this.running = false;
    }
  }


}

/*
// -------------------------
// Example Usage:

// a dummy request handlling function
function test_req_handling_function(params){
  console.log(`----------------------`)
  console.log('')
  console.log(`STARTED ${params.text}`)
  return new Promise((resolve, reject) => {
    // Simulate an asynchronous operation (e.g., fetching data from a database)
    setTimeout(() => {
        console.log(`----------------------`)
        console.log('')
        console.log(`FINISHED ${params.text}`)
        resolve(params.text);
    }, 1000 + Math.random() * 2000);
  });
}

// Generate a dummy queue of requests
const REQUESTS = (()=>{
  let REQ = []
  for(let i = 0 ; i < 20 ; i++){
    REQ.push({
      params:{'text':`Sentence ${i}`},
      func:test_req_handling_function
    })
  }
  return REQ
})()


const THREADS_NUMBER = 5

// list of functions that act as threads
const THREADS = (()=>{
  let THRDZ = []
  for(let i = 0 ; i < THREADS_NUMBER ; i++){
    THRDZ.push(
       (async (REQUEST)=>{
        return REQUEST.func(REQUEST.params)
      })
    )
  }
  return THRDZ
})()

const pool = new MTFIFO({ THREADS: THREADS });
const RESPONSES = []

pool.on('success', ((res) => {
  console.log('done ->', res)
  RESPONSES.push(res)
}));
pool.on('error', ((res) => {
  console.log('error ->', res)
  RESPONSES.push(res)

}));

pool.on('END', (() => {
  console.log('all done 🤘',RESPONSES)
  setTimeout(()=>{
    pool.add_requests(REQUESTS)
  },10000)
}));
pool.add_requests(REQUESTS);
pool.Start();
*/

module.exports = MTFIFO
