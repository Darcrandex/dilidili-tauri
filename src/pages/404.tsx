/**
 * @name NotFound
 * @description
 * @author darcrand
 */

import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <>
      <h1 className='text-center'>NotFound</h1>

      <Link to='/'>Go Home</Link>
    </>
  )
}
