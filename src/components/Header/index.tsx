import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.svg';
import { IconType } from 'react-icons/lib/cjs';

interface HeaderProps {
    returnLink?: { icon: IconType, route: string, text: string}
}

const Header: React.FC<HeaderProps> = ({ returnLink }) => {
    return (
        <header id="site-header">
            <img src={Logo} alt="Ecoleta" />
            {
                returnLink
                && (
                    <Link to={returnLink.route}>
                        <returnLink.icon/>
                        {returnLink.text}
                    </Link>
                )
            }
        </header>
    );
};

export default Header;