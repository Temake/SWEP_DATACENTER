
import {Link} from "react-router-dom"
const logo = () => {
  return (
     <div className="flex items-center justify-center mb-4">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">ScholarBase</span>
                </Link>
              </div>
  )
}

export default logo