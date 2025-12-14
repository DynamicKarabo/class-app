{/* Roster Header (with New List and Delete All Buttons) */}
<div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Class Roster</h2>

  <div className="flex items-center gap-2">
      <button
          onClick={createNewList} // Calls the new function
          className="text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1 font-medium border border-blue-200 dark:border-blue-800"
          title="Start a New, Empty Class List"
      >
          <ListPlus className="w-5 h-5" />
          New List
      </button>
      <button
          onClick={deleteAllStudents}
          className="text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 font-medium"
          title="Permanently Delete All Students"
      >
          <Trash2 className="w-5 h-5" />
          Delete Roster
      </button>
  </div>
</div>
